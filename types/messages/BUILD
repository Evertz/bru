load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "messages",
    srcs = glob(["*.ts"]),
    visibility = ["//:__subpackages__"],
    deps = [
        "@npm//@types/long",
        "@npm//@types/node",
        "@npm//long",
        "@npm//rxjs",
    ],
)
