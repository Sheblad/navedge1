"""
Report generation service
"""

import pandas as pd
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from datetime import datetime
import os
from typing import Dict, Any, List

class ReportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=20,
            alignment=1,  # Center
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceAfter=10,
            textColor=colors.darkblue
        ))
    
    def generate_pdf_report(self, start_date: datetime, end_date: datetime, report_type: str, user, db) -> str:
        """Generate PDF report"""
        
        # Create filename
        filename = f"report_{report_type}_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"
        filepath = os.path.join("uploads", "reports", filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        story = []
        
        # Title
        story.append(Paragraph(f"{report_type.title()} Report", self.styles['ReportTitle']))
        story.append(Paragraph(f"Period: {start_date.strftime('%B %d, %Y')} - {end_date.strftime('%B %d, %Y')}", self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Generate report content based on type
        if report_type == "financial":
            story.extend(self._generate_financial_report_content(start_date, end_date, user, db))
        elif report_type == "performance":
            story.extend(self._generate_performance_report_content(start_date, end_date, user, db))
        elif report_type == "fines":
            story.extend(self._generate_fines_report_content(start_date, end_date, user, db))
        elif report_type == "contracts":
            story.extend(self._generate_contracts_report_content(start_date, end_date, user, db))
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def generate_csv_report(self, start_date: datetime, end_date: datetime, report_type: str, user, db) -> str:
        """Generate CSV report"""
        
        # Generate data based on report type
        if report_type == "financial":
            data = self._get_financial_data(start_date, end_date, user, db)
        elif report_type == "performance":
            data = self._get_performance_data(start_date, end_date, user, db)
        elif report_type == "fines":
            data = self._get_fines_data(start_date, end_date, user, db)
        elif report_type == "contracts":
            data = self._get_contracts_data(start_date, end_date, user, db)
        else:
            data = []
        
        # Convert to CSV
        if data:
            df = pd.DataFrame(data)
            csv_content = df.to_csv(index=False)
        else:
            csv_content = "No data available for the selected period"
        
        return csv_content
    
    def _generate_financial_report_content(self, start_date: datetime, end_date: datetime, user, db) -> List:
        """Generate financial report content"""
        content = []
        
        # Get financial data
        data = self._get_financial_data(start_date, end_date, user, db)
        
        if data:
            # Create table
            table_data = [['Metric', 'Value']]
            for item in data:
                table_data.append([item['metric'], str(item['value'])])
            
            table = Table(table_data, colWidths=[3*inch, 2*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ]))
            
            content.append(Paragraph("Financial Summary", self.styles['SectionHeader']))
            content.append(table)
            content.append(Spacer(1, 20))
        
        return content
    
    def _generate_performance_report_content(self, start_date: datetime, end_date: datetime, user, db) -> List:
        """Generate performance report content"""
        content = []
        
        content.append(Paragraph("Performance Report", self.styles['SectionHeader']))
        content.append(Paragraph("Performance metrics and analytics for the selected period.", self.styles['Normal']))
        content.append(Spacer(1, 20))
        
        return content
    
    def _generate_fines_report_content(self, start_date: datetime, end_date: datetime, user, db) -> List:
        """Generate fines report content"""
        content = []
        
        content.append(Paragraph("Fines Report", self.styles['SectionHeader']))
        content.append(Paragraph("Traffic violations and fines for the selected period.", self.styles['Normal']))
        content.append(Spacer(1, 20))
        
        return content
    
    def _generate_contracts_report_content(self, start_date: datetime, end_date: datetime, user, db) -> List:
        """Generate contracts report content"""
        content = []
        
        content.append(Paragraph("Contracts Report", self.styles['SectionHeader']))
        content.append(Paragraph("Rental contracts and agreements for the selected period.", self.styles['Normal']))
        content.append(Spacer(1, 20))
        
        return content
    
    def _get_financial_data(self, start_date: datetime, end_date: datetime, user, db) -> List[Dict[str, Any]]:
        """Get financial data for report"""
        # This would query the database for financial data
        # For now, return mock data
        return [
            {"metric": "Total Revenue", "value": "AED 15,000.00"},
            {"metric": "Total Deposits", "value": "AED 25,000.00"},
            {"metric": "Total Fines", "value": "AED 2,500.00"},
            {"metric": "Net Revenue", "value": "AED 12,500.00"}
        ]
    
    def _get_performance_data(self, start_date: datetime, end_date: datetime, user, db) -> List[Dict[str, Any]]:
        """Get performance data for report"""
        return [
            {"metric": "Active Contracts", "value": "5"},
            {"metric": "Completed Contracts", "value": "12"},
            {"metric": "Average Contract Duration", "value": "45 days"},
            {"metric": "Customer Satisfaction", "value": "4.5/5"}
        ]
    
    def _get_fines_data(self, start_date: datetime, end_date: datetime, user, db) -> List[Dict[str, Any]]:
        """Get fines data for report"""
        return [
            {"violation": "Speeding", "amount": "AED 600.00", "date": "2024-01-20", "status": "pending"},
            {"violation": "Mobile Phone", "amount": "AED 800.00", "date": "2024-01-22", "status": "paid"}
        ]
    
    def _get_contracts_data(self, start_date: datetime, end_date: datetime, user, db) -> List[Dict[str, Any]]:
        """Get contracts data for report"""
        return [
            {"contract_id": "CNT-000001", "renter": "Ahmed Al-Rashid", "car": "Toyota Camry", "start_date": "2024-01-15", "end_date": "2024-02-15", "status": "active"},
            {"contract_id": "CNT-000002", "renter": "Mohammed Hassan", "car": "Honda Accord", "start_date": "2024-01-20", "end_date": "2024-02-20", "status": "active"}
        ]
