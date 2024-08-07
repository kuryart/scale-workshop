FROM archlinux:latest

SHELL ["/bin/bash", "--login", "-c"]

RUN pacman -Syu --noconfirm sudo

ARG USER
ARG UID
ARG USER_PASSWORD
ARG GITHUB_EMAIL
ARG SSH_PASSWORD
ARG GIT_USER_EMAIL
ARG GIT_USER_NAME

# Add user
RUN useradd -G root,wheel -u $UID -d /home/$USER $USER \
  && mkdir -p /home/$USER \
  && chown -R $USER:$USER /home/$USER \
  && echo "$USER:$USER_PASSWORD" | chpasswd \
  && echo "$USER ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Copy entrypoint to generate ssh key for github
# COPY entrypoint.sh /usr/local/bin/entrypoint.sh
# RUN chmod +x /usr/local/bin/entrypoint.sh
# COPY create-ssh-key.sh /usr/local/bin/create-ssh-key.sh
# RUN chmod +x /usr/local/bin/create-ssh-key.sh
COPY .env /home/$USER/.env
RUN chown $USER:$USER /home/$USER/.env \ 
  && chmod +x /home/$USER/.env

# Change user
USER $USER

# Install packages
RUN sudo pacman -Sy --noconfirm base-devel \
  openssh \
  unzip \
  git \
  expect \
  xsel \
  vim \
  bob \ 
  python-pip \
  nodejs \
  npm \
  yarn \
  rustup \
  ripgrep \
  lazygit \
  zsh \
  powerline-fonts \
  fzf \
  starship \
  mc

# Install oh-my-zsh, powerlevel10k and plugins
RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
  && git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k \
  && git clone https://github.com/zsh-users/zsh-autosuggestions.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-autosuggestions \
  && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Install Neovim via bob
RUN bob install '0.10.0' \
  && bob install '0.9.5' \
  && bob use '0.10.0'

# Install Neovim distributions
RUN git clone https://github.com/kuryart/lazyvim-starter.git ~/.config/nvim/lazyvim \
  && git clone https://github.com/kuryart/astronvim-template.git ~/.config/nvim/astronvim \
  && git clone https://github.com/kuryart/nvchad-starter.git ~/.config/nvim/nvchad \
  && git clone https://github.com/kuryart/LunarVim.git ~/.config/nvim/lunarvim \
  && git clone https://github.com/kuryart/Launch.nvim.git ~/.config/nvim/launchnvim \
  && git clone https://github.com/kuryart/lunarvim-starter.git ~/.config/nvim/lunarvim-starter \
  && git clone https://github.com/nvim-lua/kickstart.nvim.git ~/.config/nvim/kickstart-nvim

# Install Yay
RUN sudo pacman -S --noconfirm --needed git base-devel \
  && git clone https://aur.archlinux.org/yay.git /tmp/yay \
  && cd /tmp/yay \
  && makepkg -si --noconfirm

# Install asdf
RUN yay --noconfirm -S asdf-vm

# Install nvims
RUN /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Traap/nvims/master/install.sh)" 

# Install Bun
RUN sudo curl -fsSL https://bun.sh/install | bash

# Install Deno
RUN sudo curl -fsSL https://deno.land/install.sh | bash

# Configure Git
RUN git config --global USER.email "$GIT_USER_EMAIL" \ 
  && git config --global USER.name "$GIT_USER_NAME"

# Definir o entrypoint
# ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Change shell
RUN sudo chsh -s /usr/bin/zsh
SHELL ["/usr/bin/zsh", "--login", "-c"]

CMD ["zsh", "-c", "echo Container started; tail -f /dev/null"]
