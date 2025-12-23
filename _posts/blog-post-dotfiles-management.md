---
title: "How I Manage My Dotfiles and System Configuration with Stow, Ansible, and a Custom TUI"
layout: post
date: 23rd Dec 2025
categories: [linux, devops, dotfiles]
tags: [dotfiles, ansible, stow, wsl, automation, linux]
excerpt_separator: <!--more-->
published: true
---

Managing dotfiles across multiple machines, fresh installations, and different Linux distributions can quickly become a nightmare. Over time, I've built a system that handles everything from symlinking configuration files to fully provisioning a new development environment with a single command.

<!--more-->

In this post, I'll walk you through my setup that combines **GNU Stow** for dotfile management, **Ansible** for system automation, and a custom **Python TUI** for installing optional tools.

## The Problem

Every developer faces these challenges at some point:

1. Setting up a new machine takes hours of manual configuration
2. Keeping dotfiles in sync across multiple systems is error prone
3. Fresh OS installations mean reinstalling dozens of tools
4. WSL and native Linux environments have subtle differences
5. Different distros (Debian vs RedHat) require different package managers

My solution addresses all of these with a modular, tested, and automated approach.

## Repository Structure

```
dotfiles/
├── ansible/               # Ansible playbooks and roles
│   ├── roles/             # Modular roles for each component
│   ├── molecule/          # Molecule test configuration
│   ├── setup.yml          # Main deployment playbook
│   └── bootstrap.yml      # Bootstrap for remote servers
├── alacritty/             # Alacritty terminal config
├── bash/                  # Bash shell configuration
├── git/                   # Git configuration
├── lazygit/               # Lazygit configuration
├── neofetch/              # Neofetch config
├── nvim/                  # Neovim configuration
├── opencode/              # OpenCode configuration
├── package-selector/      # Interactive package installer
├── starship/              # Starship prompt config
├── tmux/                  # Tmux configuration
├── topgrade/              # Topgrade config
├── zellij/                # Zellij config
└── zsh/                   # Zsh shell configuration
```

## Part 1: Dotfile Management with GNU Stow

[GNU Stow](https://www.gnu.org/software/stow/) is a symlink farm manager that makes organizing dotfiles elegant and simple. Each top-level directory in my repo is a "stow package" that mirrors the target directory structure.

### How It Works

Take my `zsh/` package:

```
zsh/
├── .zshenv                     # -> ~/.zshenv
└── .config/
    └── zsh/
        ├── .zshrc              # -> ~/.config/zsh/.zshrc
        ├── shared-aliases      # -> ~/.config/zsh/shared-aliases
        └── starship_comp       # -> ~/.config/zsh/starship_comp
```

Running `stow zsh -t $HOME` creates symlinks from these files to their corresponding locations in my home directory. The beauty is that I can version control my configurations in one place while they appear in their expected locations.

### My Stow Packages

| Package | What It Configures |
|---------|-------------------|
| **alacritty** | GPU accelerated terminal with Nord, Dracula, Monokai Pro themes |
| **git** | Global config with GPG signing, delta pager, neovim as diff tool |
| **lazygit** | Custom keybindings, delta integration |
| **nvim** | LazyVim based config with 40+ LSPs, treesitter, iron.nvim for REPL |
| **starship** | Catppuccin Mocha prompt with Nerd Font icons |
| **tmux** | Oh My Tmux with Ctrl+a prefix, tmuxifier layouts |
| **zellij** | Terminal multiplexer with vim keybindings |
| **zsh** | Oh My Zsh, syntax highlighting, autosuggestions, zoxide |
| **topgrade** | System update automation |
| **opencode** | AI coding assistant configuration |

### Stow All at Once

To symlink everything:

```bash
stow --adopt */ -t "$HOME"
```

The `--adopt` flag is clever: if a file already exists at the target location, Stow moves it into the package directory, then creates the symlink. This prevents conflicts on fresh systems.

## Part 2: System Automation with Ansible

While Stow handles configurations, Ansible handles everything else: installing packages, setting up GPG keys, configuring the shell, and more.

### The Playbook

My `setup.yml` orchestrates 9 roles in sequence:

```yaml
roles:
  - discover    # Detect OS, WSL, validate environment
  - base        # System packages, Rust, Python (uv)
  - git         # GPG keys, SSH keys, git configuration
  - shell       # Zsh, Oh My Zsh, plugins
  - github      # GitHub CLI setup
  - cargo       # Rust CLI tools (exa, delta, zoxide, etc.)
  - tools       # Developer tools (neovim, lazygit, tmux, etc.)
  - dotfiles    # Stow all packages
  - docker      # Docker (Debian) or Podman (RedHat)
```

### Cross Distro Support

Each role adapts to the target system. The `discover` role detects:

1. **OS Family**: Debian (apt) vs RedHat (dnf)
2. **WSL**: Skips GUI applications like Alacritty
3. **Distribution**: Ubuntu, Debian, Rocky Linux, Fedora, CentOS

Role tasks are split into OS specific files:

```
roles/base/tasks/
├── main.yml      # Entry point
├── Debian.yml    # apt based systems
└── RedHat.yml    # dnf based systems
```

### Secrets Management

Sensitive data like email, GPG passphrase, and full name are stored in an Ansible Vault encrypted file:

```bash
# Create encrypted secrets
EDITOR=nano uv run ansible-vault create secrets.yml
```

```yaml
# secrets.yml structure
user_email: "your@email.com"
user_fullname: "Your Name"
user_passphrase: "gpg_key_passphrase"
```

### What Gets Installed

**System packages** (via apt/dnf):

1. Build essentials (gcc, make, cmake)
2. Development libraries (libssl, libffi)
3. Utilities (curl, wget, jq, tree, htop)

**Via Rust/Cargo**:

1. `exa`: Modern ls replacement
2. `git-delta`: Beautiful git diffs
3. `rm-improved`: Safer rm with trash
4. `topgrade`: Universal updater
5. `xcp`: Extended cp
6. `zoxide`: Smarter cd

**Developer Tools**:

1. Neovim (stable AppImage)
2. Lazygit (git TUI)
3. Tmux + Oh My Tmux
4. Starship prompt
5. AWS CLI v2
6. Terraform
7. SOPS (secrets management)
8. NVM (Node.js version manager)

### Running the Playbook

```bash
cd ~/dotfiles/ansible

# Install dependencies with uv
uv sync

# Deploy everything
uv run ansible-playbook setup.yml -i hosts \
    --ask-become-pass --ask-vault-pass
```

### Testing with Molecule

I test my Ansible roles using Molecule with Docker:

```yaml
# Tested platforms
platforms:
  - name: ubuntu2204
  - name: ubuntu2404
  - name: rockylinux9
  - name: fedora41
  - name: fedora43
```

This ensures the playbook works across all supported distributions before I deploy to real systems.

## Part 3: Interactive Package Selector

Not every tool is needed on every machine. For optional installations, I built a TUI using Python's [Textual](https://textual.textualize.io/) library.

### The Interface

```
┌─────────────────────────────────────────────────────────┐
│              Select packages to install                 │
├─────────────────────────────────────────────────────────┤
│  [ ] alacritty    [ ] fzf         [ ] ripgrep           │
│  [ ] awscli       [ ] lazygit     [ ] sops              │
│  [ ] bat          [x] neovim      [ ] starship          │
│  [ ] exa          [x] neofetch    [ ] terraform         │
│  [ ] fd           [ ] nvm         [x] tmux              │
│  ...                                                    │
├─────────────────────────────────────────────────────────┤
│  Navigation: h/j/k/l or arrows | Space: toggle          │
│  a: toggle all | Enter: confirm | q: quit               │
└─────────────────────────────────────────────────────────┘
```

### How It Works

Each package has a corresponding installation script in `package-selector/scripts/`:

```bash
# Example: install_neovim.sh
#!/bin/bash
curl -LO https://github.com/neovim/neovim/releases/latest/download/nvim.appimage
chmod u+x nvim.appimage
sudo mv nvim.appimage /usr/local/bin/nvim
```

The TUI runs selected scripts sequentially and streams output in real time, showing success/failure for each installation.

### Running Package Selector

```bash
cd ~/dotfiles/package-selector
uv run python main.py
```

## Part 4: Quick Setup Script (Debian Only)

For simpler scenarios on Debian based systems where Ansible feels like overkill, I have `configure.sh`:

```bash
./configure.sh
```

This interactive script:

1. Updates system packages
2. Installs build tools
3. Installs Zsh and Oh My Zsh with plugins
4. Installs Rust via rustup
5. Installs uv (modern Python package manager)
6. Installs GNU Stow
7. Optionally symlinks all dotfiles
8. Changes default shell to Zsh
9. Optionally launches package selector

> **Note**: This script currently only supports Debian based distributions. For RedHat based systems, use the Ansible playbook.

## Highlights from My Configurations

### Zsh Setup

My Zsh configuration follows XDG standards, storing everything in `~/.config/zsh/`:

```bash
# .zshenv sets ZDOTDIR
export ZDOTDIR="$HOME/.config/zsh"
```

Key features:

1. **100,000 lines of history**, shared across sessions
2. **Auto switches Node.js versions** based on `.nvmrc` files
3. **Modern CLI replacements**: `exa` for `ls`, `bat` for `cat`, `zoxide` for `cd`
4. **Unified package manager aliases** that work on Debian and RedHat

```bash
# Works on any distro
alias update="sudo $PACKAGER update"
alias install="sudo $PACKAGER install"
```

### Git Configuration

GPG signed commits are automatic:

```ini
[commit]
    gpgsign = true
[tag]
    gpgsign = true
```

Delta provides beautiful diffs:

```ini
[core]
    pager = delta

[delta]
    navigate = true
    side-by-side = true
    line-numbers = true
```

### Starship Prompt

A Catppuccin Mocha themed prompt with:

1. OS specific icons (Ubuntu, Fedora, etc.)
2. Git branch and status
3. Language versions (Python, Node, Rust)
4. Docker context when active
5. Current time

### Neovim

Built on LazyVim with:

1. 40+ language servers via Mason
2. Treesitter for syntax highlighting
3. Iron.nvim for REPL integration
4. TypeScript and JSON extras

## Getting Started

```bash
# Install git and uv
sudo apt-get update && sudo apt-get install -y git  # Debian/Ubuntu
# or: sudo dnf install -y git                       # Fedora/RHEL

curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone the repository
cd ${HOME} && git clone https://github.com/emrecanaltinsoy/dotfiles && cd dotfiles/ansible/

# Install dependencies
uv sync

# Create encrypted secrets file
EDITOR=nano uv run ansible-vault create secrets.yml

# Run the setup playbook
uv run ansible-playbook setup.yml -i hosts --ask-become-pass --ask-vault-pass
```

After deployment, logout and login again to use Zsh as your default shell, then:

```bash
source ${HOME}/.zshrc
```

## Design Principles

1. **Separation of concerns**: Dotfiles (Stow) vs System setup (Ansible) vs Optional tools (package selector)
2. **Cross distro compatibility**: Debian and RedHat families, plus WSL awareness
3. **Idempotency**: Run the playbook multiple times without side effects
4. **Security**: Vault encrypted secrets, GPG signed commits by default
5. **Modern tooling**: uv for Python, rustup for Rust, nvm for Node.js
6. **XDG compliance**: Configurations in `~/.config/` where possible
7. **Tested**: Molecule tests across 5 distribution variants

## Conclusion

This setup has saved me countless hours. A fresh WSL installation or new Linux machine goes from zero to fully configured development environment in about 15 minutes, most of which is just waiting for downloads.

The modular approach means I can:

1. Update a single configuration and have it propagate everywhere via git
2. Add new tools without touching existing configurations
3. Test changes in containers before deploying to real systems
4. Support team members on different distributions

Feel free to explore the [repository](https://github.com/emrecanaltinsoy/dotfiles) and adapt it to your own needs. The beauty of this approach is its flexibility: start with what you need and grow from there.
