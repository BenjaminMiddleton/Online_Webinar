# Installation Instructions

## ReportLab Installation

If you encounter issues with ReportLab imports, follow these steps:

### Windows

1. Install ReportLab with pip:
   ```
   pip install reportlab==4.0.5
   ```

2. If you see errors about missing DLLs or libraries, install the Visual C++ Redistributable:
   - Download from [Microsoft's website](https://aka.ms/vs/17/release/vc_redist.x64.exe)
   - Run the installer

3. You might also need to install Pillow for image support:
   ```
   pip install pillow
   ```

### macOS

1. Install dependencies using Homebrew:
   ```
   brew install freetype
   ```

2. Install ReportLab:
   ```
   pip install reportlab==4.0.5
   ```

### Linux

1. Install system dependencies:
   ```
   sudo apt-get update
   sudo apt-get install python3-dev libfreetype6-dev
   ```

2. Install ReportLab:
   ```
   pip install reportlab==4.0.5
   ```

## Troubleshooting PDF Generation

If you still encounter issues with PDF generation:

1. Verify ReportLab installation:
   ```python
   python -c "from reportlab.pdfgen import canvas; print('ReportLab working')"
   ```

2. Try a minimal example to test PDF creation:
   ```python
   from reportlab.pdfgen import canvas
   
   c = canvas.Canvas("hello.pdf")
   c.drawString(100, 100, "Hello World")
   c.save()
   ```

3. Update pip and setuptools:
   ```
   pip install --upgrade pip setuptools
   ```

4. Install the specific version that works with your environment:
   ```
   pip install reportlab==3.6.13
   ```
