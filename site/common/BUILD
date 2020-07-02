load("@io_bazel_rules_sass//sass:sass.bzl", "sass_library")

sass_library(
    name = "common_theme",
    srcs = ["_common.theme.scss"],
    deps = [
        "//ev/tooling/bes/site/common/info-header:info-header_theme",
        "//ev/tooling/bes/site/common/summary-bar:summary-bar_theme",
        "//ev/tooling/bes/site/common/status-bar:status-bar_theme"
    ],
    visibility = ["//ev/tooling/bes/site:__subpackages__"],
)