target = motor
folder = wservice
puzzle = c5t9wu87

target2 = wxapp
folder2 = msite\mscripts
puzzle2 = c5t9wu88

target3 = devAP
folder3 = wsite\js
puzzle3 = c5t9wu89

target4 = bootstrap-3.1.1
folder4 = wsite\css
folder4b = msite\mstyles

all : $(target) $(target2) $(target3)

$(target) : $(folder)\$(target).js $(folder)\$(target).js.map
$(folder)\$(target).js $(folder)\$(target).js.map : $(folder)\$(target)\*.ts
    echo "Building $(folder)\$(target).js from typescript files : "
    cd $(folder)\$(target)
    dir /b *.ts > "%TEMP%\incar_ts_$(target)_$(puzzle).tmp"
    type "%TEMP%\incar_ts_$(target)_$(puzzle).tmp"
    echo "..."
    call tsc.cmd --target "ES5" --module commonjs --sourcemap --sourceRoot "$(target)" --out "%TEMP%\$(target).js" @"%TEMP%\incar_ts_$(target)_$(puzzle).tmp"
    cd $(MAKEDIR)
    move /Y "%TEMP%\$(target).js" ".\$(folder)\" > NUL
    move /Y "%TEMP%\$(target).js.map" ".\$(folder)\" > NUL
    del "%TEMP%\incar_ts_$(target)_$(puzzle).tmp"
    echo "Done!"

$(target2) : $(folder2)\$(target2).js $(folder2)\$(target2).js.map
$(folder2)\$(target2).js $(folder2)\$(target2).js.map : $(folder2)\$(target2)\*.ts
    echo "Building $(folder2)\$(target2).js from typescript files : "
    cd $(folder2)\$(target2)
    dir /b *.ts > "%TEMP%\incar_ts_$(target2)_$(puzzle2).tmp"
    type "%TEMP%\incar_ts_$(target2)_$(puzzle2).tmp"
    echo "..."
    call tsc.cmd --target "ES5" --module commonjs --sourcemap --sourceRoot "$(target2)" --out "%TEMP%\$(target2).js" @"%TEMP%\incar_ts_$(target2)_$(puzzle2).tmp"
    cd $(MAKEDIR)
    move /Y "%TEMP%\$(target2).js" ".\$(folder2)\" > NUL
    move /Y "%TEMP%\$(target2).js.map" ".\$(folder2)\" > NUL
    del "%TEMP%\incar_ts_$(target2)_$(puzzle2).tmp"
    echo "Done!"

$(target3) : $(folder3)\$(target3).js $(folder3)\$(target3).js.map
$(folder3)\$(target3).js $(folder3)\$(target3).js.map : $(folder3)\$(target3)\*.ts
    echo "Building $(folder3)\$(target3).js from typescript files : "
    cd $(folder3)\$(target3)
    dir /b *.ts > "%TEMP%\incar_ts_$(target3)_$(puzzle3).tmp"
    type "%TEMP%\incar_ts_$(target3)_$(puzzle3).tmp"
    echo "..."
    call tsc.cmd --target "ES5" --module commonjs --sourcemap --sourceRoot "$(target3)" --out "%TEMP%\$(target3).js" @"%TEMP%\incar_ts_$(target3)_$(puzzle3).tmp"
    cd $(MAKEDIR)
    move /Y "%TEMP%\$(target3).js" ".\$(folder3)\" > NUL
    move /Y "%TEMP%\$(target3).js.map" ".\$(folder3)\" > NUL
    del "%TEMP%\incar_ts_$(target3)_$(puzzle3).tmp"
    echo "Done!"

$(target4) : $(folder4)\$(target4).css $(folder4b)\$(target4).css
$(folder4)\$(target4).css $(folder4b)\$(target4).css: $(folder4)\$(target4).less
    echo "Building $(target4).css from less files : "
    echo "..."
    cd $(folder4)
    call lessc.cmd $(target4).less > $(target4).css
    cd $(MAKEDIR)
    copy /Y $(folder4)\$(target4).css  $(folder4b)\$(target4).css
    echo "Done!"