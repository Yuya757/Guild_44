param (
    [string]$action = "start"
)

# 上位のdocker.ps1スクリプトを呼び出す
cd ..
./docker.ps1 $action
cd frontend 