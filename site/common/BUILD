load("@io_bazel_rules_sass//sass:sass.bzl", "sass_library")

sass_library(
    name = "common_theme",
    srcs = ["_common.theme.scss"],
    visibility = ["//site:__subpackages__"],
    deps = [
        "//site/common/info-header:info-header_theme",
        "//site/common/status-bar:status-bar_theme",
        "//site/common/summary-bar:summary-bar_theme",
        "//site/common/console-view:console-view_theme",
    ],
)
