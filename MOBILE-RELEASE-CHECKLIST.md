# Checklist de validação móvel

Os testes Playwright cobrem automaticamente os fluxos críticos em perfis equivalentes a
iPhone/Safari e Android/Chrome. Antes de uma liberação pública, esta checagem curta deve
ser repetida em aparelhos físicos.

## iPhone / Safari

- Abrir a URL publicada e concluir login por e-mail.
- Confirmar login com Google usando uma conta autorizada.
- Adicionar à Tela de Início, fechar o Safari e abrir pelo ícone.
- Ativar modo avião, registrar uma ação e confirmar que ela permanece após reabrir o app.
- Voltar à internet e confirmar o indicador de sincronização.
- Testar recuperação de senha pelo link recebido no Mail.

## Android / Chrome

- Abrir a URL publicada e concluir login por e-mail.
- Confirmar login com Google usando uma conta autorizada.
- Instalar o app pelo menu do Chrome e abrir pelo ícone.
- Ativar modo avião, registrar uma ação e confirmar que ela permanece após reabrir o app.
- Voltar à internet e confirmar o indicador de sincronização.
- Testar recuperação de senha pelo link recebido no Gmail.

## Casal e dados

- Conectar duas contas de teste com confirmação mútua dos e-mails.
- Confirmar que oração conjugal, dever de sentar e retiro aparecem nos dois aparelhos.
- Confirmar que oração pessoal e diário não aparecem no aparelho do cônjuge.
- Editar o mesmo dado compartilhado nos dois aparelhos e verificar o resultado final.
- Exportar o backup e sair da conta em ambos os aparelhos.
