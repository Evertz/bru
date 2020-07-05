load("@npm_bazel_typescript//:index.bzl", _ts_library = "ts_library")
load("@io_bazel_rules_sass//sass:sass.bzl", _sass_binary = "sass_binary", _sass_library = "sass_library")

def ng_module(name, deps = [], style = None, style_deps = [], assets = [], theme = None, theme_deps = [], **kwargs):
    """
    Extended ng_module abstracting building stylesheets and collecting theme files

    Note that this automatically adds @angular/core, @angular/common and rxjs to deps

    Args:
        name: name of the ts_library to set
        deps: Typescript deps for the Angular module
        style: The scss file used by the module, if present
        style_deps: Any scss deps for the style
        assets: Angular assets, eg html
        theme: The scss Angular Material theme
        theme_deps: Any deps for the scss theme
        kwargs: all other attrs passed to ts_library
    """

    if theme != None:
        _sass_library(
          name = "%s_theme" % name,
          srcs = [theme],
          deps = theme_deps,
          visibility = ["//site:__subpackages__"]
        )

    angular_assets = assets

    if style != None:
        _sass_binary(
          name = "%s_styles" % name,
          src = style,
          deps = style_deps,
        )

        angular_assets = angular_assets + [":%s_styles" % name]

    _ts_library(
        name = name,
        compiler = "//tools:tsc_wrapped_with_angular",
        use_angular_plugin = True,
        supports_workers = True,
        angular_assets = angular_assets,
        tsconfig = "//:tsconfig",
        deps = [
            "@npm//@angular/common",
            "@npm//@angular/core",
            "@npm//rxjs",
        ] + deps,
        **kwargs
    )
