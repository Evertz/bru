filegroup(
    name = "assets",
    srcs = glob([
        "*.png",
        "*.svg",
        "*.json",
        "*.css",
    ]) + ["favicon.ico"],
    visibility = ["//site:__subpackages__"],
)

exports_files(
    [
        "index.html",
        "index.prod.html",
    ],
    visibility = ["//site:__pkg__"],
)
