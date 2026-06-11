from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

doc = SimpleDocTemplate("tabla_frecuencia.pdf", pagesize=letter)
elements = []
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=16,
    spaceAfter=20
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=12,
    spaceAfter=10
)

elements.append(Paragraph("Ejercicio 1: Empleados por sucursal (n=50)", title_style))

data1 = [
    ['Valor (xi)', 'Frecuencia absoluta (fi)', 'Frecuencia acumulada (Fi)', 'Frecuencia relativa (hi)', 'Frecuencia relativa acumulada (Hi)'],
    ['9', '2', '2', '4%', '4%'],
    ['10', '4', '6', '8%', '12%'],
    ['11', '10', '16', '20%', '32%'],
    ['12', '10', '26', '20%', '52%'],
    ['13', '5', '31', '10%', '62%'],
    ['14', '3', '34', '6%', '68%'],
    ['15', '6', '40', '12%', '80%'],
    ['16', '5', '45', '10%', '90%'],
    ['17', '3', '48', '6%', '96%'],
    ['18', '2', '50', '4%', '100%'],
    ['Total', '50', '', '100%', '']
]

t1 = Table(data1)
t1.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ('GRID', (0, 0), (-1, -1), 1, colors.black)
]))
elements.append(t1)
elements.append(Spacer(1, 30))

elements.append(Paragraph("Ejercicio 2: Horas de estacionamiento (n=60)", title_style))

data2 = [
    ['Valor (xi)', 'Frecuencia absoluta (fi)', 'Frecuencia acumulada (Fi)', 'Frecuencia relativa (hi)', 'Frecuencia relativa acumulada (Hi)'],
    ['1', '5', '5', '8.3%', '8.3%'],
    ['2', '8', '13', '13.3%', '21.7%'],
    ['3', '12', '25', '20%', '41.7%'],
    ['4', '16', '41', '26.7%', '68.3%'],
    ['5', '9', '50', '15%', '83.3%'],
    ['6', '6', '56', '10%', '93.3%'],
    ['7', '4', '60', '6.7%', '100%'],
    ['Total', '60', '', '100%', '']
]

t2 = Table(data2)
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
    ('GRID', (0, 0), (-1, -1), 1, colors.black)
]))
elements.append(t2)

doc.build(elements)
print("PDF creado exitosamente: tabla_frecuencia.pdf")
