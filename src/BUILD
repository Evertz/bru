load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary")
load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "src",
    srcs = glob(["**/*.ts"]),
    deps = [
        "//types",
        "//types/messages",
        "@npm//@nestjs/common",
        "@npm//@nestjs/core",
        "@npm//@nestjs/microservices",
        "@npm//@nestjs/serve-static",
        "@npm//@nestjs/websockets",
        "@npm//@types/lodash",
        "@npm//@types/node",
        "@npm//lodash",
        "@npm//protobufjs",
        "@npm//rxjs",
    ],
)

NPM_RUNTIME_DEPS = [
    "@npm//@nestjs/platform-express",
    "@npm//@nestjs/platform-socket.io",
    "@npm//@grpc/proto-loader",
    "@npm//grpc",
]

nodejs_binary(
    name = "bin",
    data = [
        ":src",
        "//src/proto",
    ] + NPM_RUNTIME_DEPS,
    entry_point = ":main.ts",
)
