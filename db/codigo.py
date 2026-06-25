import sqlite3

# ===== CRIAR E CONFIGURAR BANCO DE DADOS =====
def criar_banco():
    """Cria o banco de dados e a tabela se não existirem"""
    conexao = sqlite3.connect("usuarios.db")
    cursor = conexao.cursor()
    
    # Cria a tabela
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    """)
    
    # Insere alguns usuários de teste (se a tabela estiver vazia)
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    if cursor.fetchone()[0] == 0:
        usuarios_teste = [
            ("kevin@gmail.com", "12345"),
            ("admin@gmail.com", "senha123"),
            ("usuario@gmail.com", "abc123")
        ]
        cursor.executemany("INSERT INTO usuarios (email, senha) VALUES (?, ?)", usuarios_teste)
        print("✓ Banco de dados criado com usuários de teste!")
    
    conexao.commit()
    conexao.close()

# ===== FUNÇÃO DE LOGIN =====
def fazer_login(email, senha):
    """Verifica as credenciais no banco de dados"""
    conexao = sqlite3.connect("usuarios.db")
    cursor = conexao.cursor()
    
    # Faz a query no banco buscando pelo email
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
    resultado = cursor.fetchone()
    conexao.close()
    
    # Verifica se encontrou o usuário
    if resultado:
        email_bd = resultado[1]
        senha_bd = resultado[2]
        
        # Compara a senha
        if email_bd == email and senha_bd == senha:
            return True, "Login bem-sucedido! ✓"
        else:
            return False, "Senha inválida!"
    else:
        return False, "Usuário não encontrado!"

# ===== PROGRAMA PRINCIPAL =====
if __name__ == "__main__":
    # Cria o banco na primeira execução
    criar_banco()
    
    # Recebe input do usuário
    user = input("Email: ")
    senha = input("Senha: ")
    
    # Faz o login
    sucesso, mensagem = fazer_login(user, senha)
    
    if sucesso:
        print(f"✓ {mensagem}")
    else:
        print(f"✗ {mensagem}")
    
    # Mostra os usuários disponíveis
    print("\n--- Usuários de teste disponíveis ---")
    conexao = sqlite3.connect("usuarios.db")
    cursor = conexao.cursor()
    cursor.execute("SELECT email FROM usuarios")
    for row in cursor.fetchall():
        print(f"  • {row[0]}")
    conexao.close()