$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$mavenWrapper = Join-Path $repositoryRoot 'mvnw.cmd'
$projectPom = Join-Path $PSScriptRoot 'pom.xml'

if (-not (Test-Path -LiteralPath $mavenWrapper)) {
    throw "Không tìm thấy Maven Wrapper: $mavenWrapper"
}

& $mavenWrapper -f $projectPom spring-boot:run
exit $LASTEXITCODE
