#!/usr/bin/env zsh

# Inicia o ssh-agent
eval "$(ssh-agent -s)"

# Cria a chave SSH
# ssh-keygen -t ed25519 -C "devcontainers-rust-dev" -f "$HOME/.ssh/devcontainers-rust-dev" -N ""

if [ ! -f "$SSH_KEY_PATH" ]; then
  echo 'SSH key not found. Generating new key...'
  # eval "$(ssh-agent -s)"
  ssh-keygen -t ed25519 -C "$GITHUB_EMAIL" -f "$SSH_KEY_PATH" -N "$SSH_PASSWORD"
fi

# Verifica se a chave já está adicionada ao ssh-agent
if ! ssh-add -l | grep -q "$SSH_KEY_PATH"; then
  echo "No SSH keys are loaded. Adding keys..."

  # Adiciona a chave SSH de forma não interativa usando expect
  /usr/bin/expect <<EOF
set ssh_key_path "$SSH_KEY_PATH"
set ssh_password "$SSH_PASSWORD"

spawn ssh-add \$ssh_key_path
expect {
  "Enter passphrase for \$ssh_key_path:" {
    send "\$ssh_password\r"
    expect eof
  }
  "Identity added" {
    expect eof
  }
}
EOF
fi

unset SSH_PASSWORD
unset SSH_KEY_PATH
unset DB_USER
unset DB_PASSWORD
unset USER_PASSWORD
unset GITHUB_EMAIL
unset GIT_USER_EMAIL
unset GIT_USER_NAME

# Exportar variáveis de ambiente do ssh-agent para o usuário dev
echo "export SSH_AGENT_PID=$SSH_AGENT_PID" >/home/$USER/.ssh-agent-env
echo "export SSH_AUTH_SOCK=$SSH_AUTH_SOCK" >>/home/$USER/.ssh-agent-env

# Carregar as variáveis de ambiente no .zshrc do usuário dev
echo "source /home/$USER/.ssh-agent-env" >>/home/$USER/.zshrc

exec "$@"
