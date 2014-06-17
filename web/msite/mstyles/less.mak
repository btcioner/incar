target = bootstrap

$(target).css : $(target).less
    @echo "Building bootstrap files : "
    @echo "..."
    @call lessc $(target).less > $(target).css
    @echo "Done!"

