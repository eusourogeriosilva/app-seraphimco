// Seraphim.co — página de contato. O envio real depende do back-end, ainda não definido:
// enquanto isso, o formulário valida, anuncia o sucesso e emite "seraphim:enviar" (cancelável) com os dados.
import { initForm } from '../components/form.ts';
import { initMenu } from '../components/menu.ts';

const form = document.querySelector<HTMLFormElement>('form.form');
if (form) initForm(form);
initMenu();
