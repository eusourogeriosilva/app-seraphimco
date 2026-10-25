// Seraphim.co — página de contato. O envio real depende do back-end, ainda não definido:
// enquanto isso, o formulário valida, anuncia o sucesso e emite "seraphim:enviar" (cancelável) com os dados.
// ?interesse=diagnostico|consultoria|palestra pré-seleciona a opção correspondente (links das páginas de serviço).
// Campos com data-mostrar-se="<interesse>" só aparecem (e só são enviados) quando aquele interesse está marcado.
import { initForm } from '../components/form.ts';
import { initMenu } from '../components/menu.ts';

const form = document.querySelector<HTMLFormElement>('form.form');
if (form) {
  const interesse = new URLSearchParams(location.search).get('interesse');
  const opcao = interesse ? form.querySelector<HTMLInputElement>(`input[name="interesse"][value="${CSS.escape(interesse)}"]`) : null;
  if (opcao) opcao.checked = true;

  const alternar = (): void => {
    const escolhido = form.querySelector<HTMLInputElement>('input[name="interesse"]:checked')?.value ?? null;
    for (const bloco of form.querySelectorAll<HTMLElement>('[data-mostrar-se]')) {
      const mostrar = bloco.dataset['mostrarSe'] === escolhido;
      bloco.hidden = !mostrar;
      for (const c of bloco.querySelectorAll<HTMLInputElement>('input')) c.disabled = !mostrar;
    }
  };
  form.addEventListener('change', (e) => { if ((e.target as HTMLElement).matches('input[name="interesse"]')) alternar(); });
  form.addEventListener('reset', () => setTimeout(alternar)); // o reset desmarca o interesse depois do evento
  alternar();
  initForm(form);
}
initMenu();
