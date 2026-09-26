---
name: rust-structure
description: Defines the project file structure for rust projects.
---

# Rust code structure skill

This skill gives principles and guidlines for you to follow for keeping a logical, coherent and homogeinous folder and code structure across codebases.
Throughout this file, the term `models` will be used to englobe `type`, `struct` and `enum` definitions.

## When to use this skill

- Use this for all rust projects.
- This is helpful for keeping a logical, coherent and homogeinous folder structure across codebases.
- You can derogate to those principles when the user asks for it.
- If any doubt about where to put a module/piece of code, ask the user for directives.

## How to use it

### Code structure

- DRY: Don't Repeat Yourself => avoid code repetition and prefer sharing code.
- Prefer traits to standalone functions when relevant, this allows sharing more code.
- Coment your code with rust comments, especially models, traits, macros and functions/methods.

### Folder structure

#### Modules

##### Main modules

- `main.rs`
  Main entry point for the codebase.
- `prelude.rs`
  Main definitions to use throughout the codebase like the main result type `type Result<T>` or the wrapper type `struct W(pub T)` (useful when implementing external traits for external types).
- `error.rs` or `error/mod.rs`
  Main codebase error definitions. For small codebases, a simple `error.rs` module can be enough. For bigger ones, use `error/mod.rs` with the hereafter defined module structure. You will use the `snafu` crate to facilitate error handling.

#### Other modules

- One module corresponds to one functionality (or group of related functionalities).
- Name the modules with consise yet meaningful names
- The files after-mentionned can be defined at the root level of the project for code that should be available globally (optional, only if needed).
- Modules can contain submodules, which follow the same folder structure. Submodules should be related to their parent (e.g. `categories` can contain `subcategories`).
- Submodules' models can implement their parent's traits.
- Submodules' code should be exposed on the same level as their parent module (the parent's `mod.rs` has `pub use submodule::*;`).

Here's the structure for one module:

- `mod.rs`
  This is the entry point of the module, which should expose only necessary code like models, traits and macros.
- `models.rs`
  All the model definitions, like types, structs and enums for the module.
- `traits.rs`
  All the module traits that are related to the module.
- `impls.rs`
  All trait implementations (including `impl MyStruct { ... }` definitions) that are not `From` and `TryFrom` for the module's models.
- `froms.rs`
  All `From` and `TryFrom` trait implementations for the module's models.
- `macros.rs`
  All macro definitions for the module. Can be useful to avoid repeating code.
- `funcs.rs`
  All standalone functions definitions (should be used only when necessary as you should avoid them).
- `consts.rs`
  All constants and static variables definitions.
- `commands.rs`
  All commands definitions for tauri.
