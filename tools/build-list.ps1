# Fetch the servant list from Atlas Academy and write data/servants.js
# (collection number, servant id for the image URL, rarity for the cost, and the Japanese name).
# Written as a .js file so index.html also works when opened straight from disk.
# Usage: powershell -ExecutionPolicy Bypass -File tools/build-list.ps1

$root    = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root 'data'
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

$tmp = Join-Path $env:TEMP 'fgo_basic_servant.json'
Invoke-WebRequest -Uri 'https://api.atlasacademy.io/export/JP/basic_servant.json' -OutFile $tmp -UseBasicParsing
$all = Get-Content $tmp -Raw -Encoding UTF8 | ConvertFrom-Json

# index into the array so each servant is piped separately (PS 5.1 would otherwise pass the whole array as one object)
$servants = $all[0..($all.Count - 1)] |
    Where-Object { $_.type -in 'normal', 'heroine' -and $_.collectionNo -gt 0 } |
    Sort-Object collectionNo

$entries = foreach ($s in $servants) {
    # face url ends with f_<id>0.png; figure images live under <id>
    $id = ([IO.Path]::GetFileNameWithoutExtension($s.face) -replace '^f_', '')
    $id = $id.Substring(0, $id.Length - 1)
    $name = $s.name.Replace('\', '\\').Replace('"', '\"')
    '{no:' + [int]$s.collectionNo + ',id:' + $id + ',r:' + [int]$s.rarity + ',n:"' + $name + '"}'
}

$js = "window.SERVANTS = [" + ($entries -join ',') + "];`n"
[IO.File]::WriteAllText((Join-Path $dataDir 'servants.js'), $js, (New-Object Text.UTF8Encoding($false)))
"servants.js: $(@($servants).Count) entries (latest No.$(@($servants)[-1].collectionNo))"
