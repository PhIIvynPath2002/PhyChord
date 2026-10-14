; Standard NSIS installer with runtime WriteUninstaller. No prebuilt uninstaller
; execution through Wine is required. Application payload is embedded directly.
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"
; NSIS File globbing on Windows needs native backslash separators. POSIX
; makensis translates these automatically; mixed /dist/.../* breaks Win32 globbing.
Icon "${PROJECT_DIR}\build\icon.ico"
UninstallIcon "${PROJECT_DIR}\build\icon.ico"
!ifndef MUI_ICON
  !define MUI_ICON "${PROJECT_DIR}\build\icon.ico"
!endif
!ifndef MUI_UNICON
  !define MUI_UNICON "${PROJECT_DIR}\build\icon.ico"
!endif
Name "PhyChord"
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\Programs\PhyChord"
InstallDirRegKey HKCU "Software\PhyChord" "InstallPath"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\PhyChord.exe"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "English"
Function .onVerifyInstDir
 ${GetFileName} "$INSTDIR" $0
 ${If} $0 != "PhyChord"
   MessageBox MB_OK "请选择名为 PhyChord 的安装目录。"
   Abort
 ${EndIf}
 IfFileExists "$INSTDIR\*.*" 0 verified
 IfFileExists "$INSTDIR\.phychord-install" verified 0
 MessageBox MB_OK "请选择空目录，避免覆盖已有文件。"
 Abort
 verified:
FunctionEnd
Section "Install"
 SetShellVarContext current
 SetOutPath "$INSTDIR"
 !ifdef APP_ARM64
   ReadEnvStr $0 "PROCESSOR_ARCHITEW6432"
   ReadEnvStr $1 "PROCESSOR_ARCHITECTURE"
   ${If} $0 == "ARM64"
   ${OrIf} $1 == "ARM64"
     File /r "${PROJECT_DIR}\dist\win-arm64-unpacked\*"
   ${Else}
     !ifdef APP_64
       File /r "${PROJECT_DIR}\dist\win-unpacked\*"
     !else
       MessageBox MB_OK "此安装包需要 Windows ARM64。"
       Abort
     !endif
   ${EndIf}
 !else
   File /r "${PROJECT_DIR}\dist\win-unpacked\*"
 !endif
 FileOpen $0 "$INSTDIR\.phychord-install" w
 FileWrite $0 "com.phychord.app"
 FileClose $0
 WriteUninstaller "$INSTDIR\Uninstall.exe"
 WriteRegStr HKCU "Software\PhyChord" "InstallPath" "$INSTDIR"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PhyChord" "DisplayName" "PhyChord"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PhyChord" "DisplayVersion" "${VERSION}"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PhyChord" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PhyChord" "DisplayIcon" "$INSTDIR\PhyChord.exe"
 CreateDirectory "$SMPROGRAMS\PhyChord"
 CreateShortcut "$SMPROGRAMS\PhyChord\PhyChord.lnk" "$INSTDIR\PhyChord.exe"
 CreateShortcut "$DESKTOP\PhyChord.lnk" "$INSTDIR\PhyChord.exe"
SectionEnd
Section "Uninstall"
 SetShellVarContext current
 IfFileExists "$INSTDIR\.phychord-install" 0 invalid
 FileOpen $0 "$INSTDIR\.phychord-install" r
 FileRead $0 $1
 FileClose $0
 StrCmp $1 "com.phychord.app" 0 invalid
 Delete "$DESKTOP\PhyChord.lnk"
 Delete "$SMPROGRAMS\PhyChord\PhyChord.lnk"
 RMDir "$SMPROGRAMS\PhyChord"
 DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\PhyChord"
 DeleteRegKey HKCU "Software\PhyChord"
 RMDir /r "$INSTDIR"
 Goto done
 invalid:
 MessageBox MB_OK "安装目录标记无效；已取消卸载以保护文件。"
 done:
SectionEnd
