import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # Read markdown
    with open('FINAL_REVIEW_1_SUBMISSION_DOCUMENT.md', 'r', encoding='utf-8') as f:
        md_text = f.read()

    lines = md_text.split('\n')
    
    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    brain_dir = r'C:\Users\gouri\.gemini\antigravity\brain\2af6fea9-2af9-4bfd-9981-ef1464db512c'

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check code block
        if line.strip().startswith('```'):
            if in_code_block:
                # Flush code block
                in_code_block = False
                code_text = '\n'.join(code_lines)
                code_lines = []
                
                tbl = doc.add_table(rows=1, cols=1)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = tbl.cell(0, 0)
                cell.width = Inches(6.5)
                set_cell_background(cell, 'F1F5F9')
                set_cell_margins(cell, top=120, bottom=120, left=200, right=200)
                
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_before = Pt(4)
                cp.paragraph_format.space_after = Pt(4)
                crun = cp.add_run(code_text)
                crun.font.name = 'Consolas'
                crun.font.size = Pt(9.5)
                crun.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
                
                p_spacer = doc.add_paragraph()
                p_spacer.paragraph_format.space_before = Pt(0)
                p_spacer.paragraph_format.space_after = Pt(4)
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Check table
        if line.strip().startswith('|') and line.strip().endswith('|'):
            table_lines.append(line)
            # Peek next line
            if i + 1 < len(lines) and lines[i+1].strip().startswith('|') and lines[i+1].strip().endswith('|'):
                i += 1
                continue
            else:
                # Flush table
                # Filter out separator row e.g. |---|---|
                rows_data = []
                for tline in table_lines:
                    cols = [c.strip() for c in tline.strip().strip('|').split('|')]
                    if all(set(c).issubset({'-', ' ', ':'}) for c in cols):
                        continue
                    rows_data.append(cols)
                
                if rows_data:
                    num_cols = max(len(r) for r in rows_data)
                    tbl = doc.add_table(rows=len(rows_data), cols=num_cols)
                    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                    
                    for r_idx, row_cols in enumerate(rows_data):
                        is_header = (r_idx == 0)
                        for c_idx in range(num_cols):
                            val = row_cols[c_idx] if c_idx < len(row_cols) else ''
                            cell = tbl.cell(r_idx, c_idx)
                            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
                            
                            if is_header:
                                set_cell_background(cell, '1E3A8A')
                            elif r_idx % 2 == 1:
                                set_cell_background(cell, 'F8FAFC')
                            else:
                                set_cell_background(cell, 'FFFFFF')
                                
                            cp = cell.paragraphs[0]
                            cp.paragraph_format.space_before = Pt(3)
                            cp.paragraph_format.space_after = Pt(3)
                            
                            crun = cp.add_run(val)
                            crun.font.name = 'Calibri'
                            crun.font.size = Pt(10)
                            if is_header:
                                crun.bold = True
                                crun.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                            else:
                                crun.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

                    p_spacer = doc.add_paragraph()
                    p_spacer.paragraph_format.space_before = Pt(0)
                    p_spacer.paragraph_format.space_after = Pt(6)
                
                table_lines = []
                i += 1
                continue

        # Check image
        img_match = re.match(r'!\[(.*?)\]\((.*?)\)', line.strip())
        if img_match:
            caption = img_match.group(1)
            raw_path = img_match.group(2).replace('\\', '/')
            # Extract filename
            fname = os.path.basename(raw_path)
            candidate_paths = [
                os.path.join(brain_dir, fname),
                os.path.join(r'c:\cloud_project', fname),
                raw_path.replace('/C:/', 'C:/')
            ]
            found_img = None
            for p in candidate_paths:
                if os.path.exists(p):
                    found_img = p
                    break
            
            if found_img:
                p_img = doc.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.paragraph_format.space_before = Pt(8)
                p_img.paragraph_format.space_after = Pt(4)
                run_img = p_img.add_run()
                run_img.add_picture(found_img, width=Inches(6.0))
                
                # Check next line for italic caption
                if i + 1 < len(lines) and lines[i+1].strip().startswith('*Figure'):
                    i += 1
                    p_cap = doc.add_paragraph()
                    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    p_cap.paragraph_format.space_before = Pt(2)
                    p_cap.paragraph_format.space_after = Pt(10)
                    rcap = p_cap.add_run(lines[i].strip().replace('*', ''))
                    rcap.font.name = 'Calibri'
                    rcap.font.size = Pt(9.5)
                    rcap.italic = True
                    rcap.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
            i += 1
            continue

        # Check Headings
        s_line = line.strip()
        if s_line.startswith('# '):
            h = doc.add_heading(s_line[2:], level=1)
            h.paragraph_format.space_before = Pt(16)
            h.paragraph_format.space_after = Pt(8)
            for r in h.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(22)
                r.bold = True
                r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        elif s_line.startswith('## '):
            h = doc.add_heading(s_line[3:], level=2)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(6)
            for r in h.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(16)
                r.bold = True
                r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        elif s_line.startswith('### '):
            h = doc.add_heading(s_line[4:], level=3)
            h.paragraph_format.space_before = Pt(10)
            h.paragraph_format.space_after = Pt(4)
            for r in h.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(13)
                r.bold = True
                r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        elif s_line.startswith('#### '):
            h = doc.add_heading(s_line[5:], level=4)
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(3)
            for r in h.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(11.5)
                r.bold = True
                r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
        elif s_line.startswith('---'):
            # Horizontal rule or break
            pass
        elif s_line.startswith('- ') or s_line.startswith('* '):
            # Bullet
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            
            # Format inline bold/italic
            bullet_text = s_line[2:]
            parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    p.add_run(part)
        elif re.match(r'^\d+\.\s+', s_line):
            # Numbered list
            m = re.match(r'^(\d+\.)\s+(.*)', s_line)
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.left_indent = Inches(0.25)
            
            num_label = m.group(1) + ' '
            r_num = p.add_run(num_label)
            r_num.bold = True
            
            rest = m.group(2)
            parts = re.split(r'(\*\*.*?\*\*)', rest)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    p.add_run(part)
        elif s_line != '':
            # Normal paragraph
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(5)
            p.paragraph_format.line_spacing = 1.15
            
            parts = re.split(r'(\*\*.*?\*\*)', s_line)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                else:
                    p.add_run(part)

        i += 1

    out_file = 'FINAL_REVIEW_1_SUBMISSION_DOCUMENT.docx'
    saved_name = out_file
    try:
        doc.save(out_file)
        print(f'Successfully generated {out_file} ({os.path.getsize(out_file)} bytes)!')
    except PermissionError:
        saved_name = 'FINAL_REVIEW_1_SUBMISSION_DOCUMENT_UPDATED.docx'
        doc.save(saved_name)
        print(f'Original docx was locked by Word. Successfully generated {saved_name} ({os.path.getsize(saved_name)} bytes)!')

    artifact_out = os.path.join(brain_dir, saved_name)
    try:
        doc.save(artifact_out)
        print(f'Also saved to artifact: {artifact_out}')
    except Exception as e:
        print('Could not save to artifact directory:', e)

if __name__ == '__main__':
    create_document()
