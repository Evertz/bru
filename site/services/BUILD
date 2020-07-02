load("//ev/tooling/bazel/rules_ev_web:index.bzl", "ev_ng_module")

ev_ng_module(
    name = "services",
    srcs = ["bes.service.ts"],
    deps = [
        "@npm//@angular/material",
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)
