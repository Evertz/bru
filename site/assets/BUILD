filegroup(
    name = "assets",
    srcs = glob(["*.png", "*.svg", "*.json", "*.css"]) + ["favicon.ico"],
    visibility = ["//ev/tooling/bes/site:__subpackages__"]
)

exports_files([
    "index.html",
    "index.prod.html",
], visibility = ["//ev/tooling/bes/site:__pkg__"])