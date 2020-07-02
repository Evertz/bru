load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "duration-pipe",
    srcs = glob(["*.ts"]),
    deps = [
        "@npm//moment",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
