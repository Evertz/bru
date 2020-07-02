import { OptionEffectTag, OptionMetadataTag } from './option-filters';

// A single command line option.
//
// This represents the option itself, but does not take into account the type of
// option or how the parser interpreted it. If this option is part of a command
// line that represents the actual input that Bazel received, it would, for
// example, include expansion flags as they are. However, if this option
// represents the canonical form of the command line, with the values as Bazel
// understands them, then the expansion flag, which has no value, would not
// appear, and the flags it expands to would.
export interface Option {
  // How the option looks with the option and its value combined. Depending on
  // the purpose of this command line report, this could be the canonical
  // form, or the way that the flag was set.
  //
  // Some examples: this might be `--foo=bar` form, or `--foo bar` with a space;
  // for boolean flags, `--nobaz` is accepted on top of `--baz=false` and other
  // negating values, or for a positive value, the unqualified `--baz` form
  // is also accepted. This could also be a short `-b`, if the flag has an
  // abbreviated form.
  combinedForm: string;

  // The canonical name of the option, without the preceding dashes.
  optionName: string;

  // The value of the flag, or unset for flags that do not take values.
  // Especially for boolean flags, this should be in canonical form, the
  // combined_form field above gives room for showing the flag as it was set
  // if that is preferred.
  optionValue: string;

  // This flag's tagged effects. See OptionEffectTag's java documentation for
  // details.
  effectTags: OptionEffectTag[];

  // Metadata about the flag. See OptionMetadataTag's java documentation for
  // details.
  metadataTags: OptionMetadataTag[];
}

// Wrapper to allow a list of strings in the "oneof" section_type.
export interface ChunkList {
  chunk: string[];
}

// Wrapper to allow a list of options in the "oneof" section_type.
export interface OptionList {
  option: Option[];
}

// A section of the Bazel command line.
export interface CommandLineSection {
  // The name of this section, such as "startup_option" or "command".
  sectionLabel: string;

  // Sections with non-options, such as the list of targets or the command,
  // should use simple string chunks.
  chunkList?: ChunkList;

  // Startup and command options are lists of options and belong here.
  optionList?: OptionList;
}

// Representation of a Bazel command line.
export interface CommandLine {
  // A title for this command line value, to differentiate it from others.
  // In particular, a single invocation may wish to report both the literal and
  // canonical command lines, and this label would be used to differentiate
  // between both versions. This is a string for flexibility.
  commandLineLabel: string;

  // A Bazel command line is made of distinct parts. For example,
  //    `bazel --nomaster_bazelrc test --nocache_test_results //foo:aTest`
  // has the executable "bazel", a startup flag, a command "test", a command
  // flag, and a test target. There could be many more flags and targets, or
  // none (`bazel info` for example), but the basic structure is there. The
  // command line should be broken down into these logical sections here.
  sections: CommandLineSection[];
}