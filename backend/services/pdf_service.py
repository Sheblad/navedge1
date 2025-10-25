"""
PDF generation service for contracts
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os
from typing import List

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='ContractTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='ContractText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6
        ))
    
    def generate_contract_pdf(self, contract, renter, car, organization):
        """Generate professional PDF contract"""
        
        # Create filename
        filename = f"contract_{contract.id}.pdf"
        filepath = os.path.join("uploads", "contracts", filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Title
        story.append(Paragraph("VEHICLE RENTAL AGREEMENT", self.styles['ContractTitle']))
        story.append(Spacer(1, 20))
        
        # Contract details table
        contract_data = [
            ['Contract ID:', str(contract.id)],
            ['Date:', datetime.now().strftime("%B %d, %Y")],
            ['Organization:', organization.name],
            ['Renter Name:', renter.name],
            ['Renter Email:', renter.email],
            ['Renter Phone:', renter.phone or 'N/A'],
            ['Vehicle:', f"{car.make} {car.model} {car.year}"],
            ['License Plate:', car.license_plate],
            ['Start Date:', contract.start_date.strftime("%B %d, %Y")],
            ['End Date:', contract.end_date.strftime("%B %d, %Y")],
            ['Deposit Amount:', f"AED {contract.deposit_amount:,.2f}"],
            ['Monthly Rent:', f"AED {contract.monthly_rent:,.2f}"],
            ['Daily KM Limit:', f"{contract.daily_km_limit} km"]
        ]
        
        contract_table = Table(contract_data, colWidths=[2*inch, 3*inch])
        contract_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
        ]))
        
        story.append(contract_table)
        story.append(Spacer(1, 20))
        
        # Terms and conditions
        story.append(Paragraph("TERMS AND CONDITIONS", self.styles['SectionHeader']))
        story.append(Spacer(1, 10))
        
        terms = contract.terms or [
            "Driver must maintain valid UAE driving license",
            "Vehicle must be returned in same condition",
            "Fines will be deducted from deposit",
            "Monthly rent due by 1st of each month"
        ]
        
        for i, term in enumerate(terms, 1):
            story.append(Paragraph(f"{i}. {term}", self.styles['ContractText']))
        
        story.append(Spacer(1, 20))
        
        # Additional terms
        additional_terms = [
            "The renter is responsible for all traffic violations and fines incurred during the rental period.",
            "Any damage to the vehicle will be deducted from the security deposit.",
            "The renter must return the vehicle in the same condition as received.",
            "Late return of the vehicle will result in additional charges.",
            "The renter is responsible for fuel costs during the rental period.",
            "Insurance coverage is provided as per UAE law requirements.",
            "The renter must not use the vehicle for commercial purposes without written permission.",
            "Any modifications to the vehicle are strictly prohibited."
        ]
        
        story.append(Paragraph("ADDITIONAL TERMS", self.styles['SectionHeader']))
        story.append(Spacer(1, 10))
        
        for i, term in enumerate(additional_terms, 1):
            story.append(Paragraph(f"{i}. {term}", self.styles['ContractText']))
        
        story.append(Spacer(1, 30))
        
        # Signature section
        signature_data = [
            ['Renter Signature:', '_________________', 'Date:', '_________________'],
            ['Owner Signature:', '_________________', 'Date:', '_________________']
        ]
        
        signature_table = Table(signature_data, colWidths=[1.5*inch, 2*inch, 1*inch, 2*inch])
        signature_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ]))
        
        story.append(signature_table)
        
        # Build PDF
        doc.build(story)
        
        return filepath
