@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off
set ERROR_CODE=0

@REM set %ProcessArchitecture% to x86 or x64
set PROCESS_ARCHITECTURE=%PROCESSOR_ARCHITECTURE%

if not "%JAVA_HOME%" == "" goto OkJHome
echo.
echo ERROR: JAVA_HOME not set! Please point JAVA_HOME to JDK 17+
goto error

:OkJHome
if exist "%JAVA_HOME%\bin\java.exe" goto init

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto error

:init
set MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
if "%MAVEN_PROJECTBASEDIR%" == "" set MAVEN_PROJECTBASEDIR=%~dp0

"%JAVA_HOME%\bin\java.exe" -version

:error
exit /b %ERROR_CODE%
