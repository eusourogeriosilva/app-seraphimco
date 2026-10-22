// Seraphim.co — página de contato. O envio real depende do back-end, ainda não definido:
// enquanto isso, o formulário valida, anuncia o sucesso e emite "seraphim:enviar" (cancelável) com os dados.
// ?interesse=diagnostico|consultoria|palestra pré-seleciona a opção correspondente (links das páginas de serviço).
import { initForm } from '../components/form.ts';
import { initMenu } from '../components/menu.ts';

const form = document.querySelector<HTMLFormElement>('form.form');
if (form) {
  const interesse = new URLSearchParams(location.search).get('interesse');
  const opcao = interesse ? form.querySelector<HTMLInputElement>(`input[name="interesse"][value="${CSS.escape(interesse)}"]`) : null;
  if (opcao) opcao.checked = true;
  initForm(form);
}
initMenu();
