Add-Type -AssemblyName System.Web

##########################################################
##################### Build Module #######################
##########################################################
$currentPath = split-path -parent $MyInvocation.MyCommand.Definition
$folderName = $((get-item $currentPath).Name) -replace "[^A-Za-z]"

Push-Location -Path $currentPath

npm i
npm run build

$scriptInject = [System.Web.HttpUtility]::HtmlEncode($(Get-Content ($currentPath + '/build/index.html')))

$(Get-Content '.\WebPartDefinition.dwp') -replace "{FolderNameTemplate}", $folderName | Set-Content ".\build\$folderName.dwp"
$(Get-Content '.\WebPartDefinition.webpart') -replace "{FolderNameTemplate}", $folderName -replace "{ScriptInject}", $scriptInject | Set-Content ".\build\$folderName.webpart"

#increaseSolutionVersionNumber $currentPath

[Console]::ResetColor()

Pop-Location