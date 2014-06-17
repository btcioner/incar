target = wxapp
puzzle = c5t9wx87

$(target).js $(target).js.map : $(target)\*.ts
    @echo "Building typescript files : "
    @cd $(target)
    @dir /b *.ts > "%TEMP%\incar_ts_$(puzzle).tmp"
    @type "%TEMP%\incar_ts_$(puzzle).tmp"
    @echo "..."
    @call tsc.cmd --target "ES5" --module commonjs --sourcemap --sourceRoot "$(target)" --out "%TEMP%\$(target).js" @"%TEMP%\incar_ts_$(puzzle).tmp"
    @cd ..
    @move /Y "%TEMP%\$(target).js" ".\" >NUL
    @move /Y "%TEMP%\$(target).js.map" ".\" >NUL
    @del "%TEMP%\incar_ts_$(puzzle).tmp"
    @echo "Done!"

