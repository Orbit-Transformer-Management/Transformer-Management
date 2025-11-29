@echo off
echo ============================================
echo Installing Maintenance Form Dependencies
echo ============================================
echo.

cd /d "%~dp0"

echo Current directory: %CD%
echo.

echo Installing required packages...
echo - react-signature-canvas (signature capture)
echo - jspdf (PDF generation)
echo - date-fns (date formatting)
echo.

call npm install react-signature-canvas jspdf date-fns

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo Installation completed successfully!
    echo ============================================
    echo.
    echo You can now run: npm run dev
    echo.
) else (
    echo.
    echo ============================================
    echo Installation failed!
    echo ============================================
    echo Please check the error messages above.
    echo.
)

pause
