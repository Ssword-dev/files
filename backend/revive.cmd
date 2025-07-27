@echo OFF
SETLOCAL

:: Phase: Restore Dependancies And Tools ::
dotnet restore
dotnet tool install --global dotnet-ef

ENDLOCAL
