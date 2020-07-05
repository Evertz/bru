load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "types",
    srcs = [
        "events.ts",
        "invocation-ref.ts",
    ],
    visibility = ["//:__subpackages__"],
    deps = ["@npm//rxjs"],
)
