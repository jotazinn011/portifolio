// 1. Configuração e Conexão com o Supabase
const SUPABASE_URL = "https://eyxvayeaukvjuqayekch.supabase.co";
const SUPABASE_KEY = "sb_publishable_VLI4uJG-UFaB_YPHlHA5JA_C5_-zxEw";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos do HTML
const projectForm = document.getElementById('projectForm');
const formTitle = document.getElementById('formTitle');
const btnCancel = document.getElementById('btnCancel');
const projectIdInput = document.getElementById('projectId');
const tableBody = document.getElementById('projectsTableBody');

// 2. Carregar Projetos (SELECT)
async function loadProjects() {
  if (!tableBody) return;

  const { data, error } = await supabase
    .from('projetos')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar projetos:', error.message);
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar dados: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum projeto cadastrado.</td></tr>`;
    return;
  }

  tableBody.innerHTML = '';
  data.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td><img src="${p.img || 'https://via.placeholder.com/50'}" class="img-preview" alt="Preview"></td>
      <td><strong>${p.nome}</strong></td>
      <td>${p.descricao || '-'}</td>
      <td>${p.link ? `<a href="${p.link}" target="_blank">Acessar</a>` : '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-edit" onclick="editProject(${p.id}, '${escapeHtml(p.nome)}', '${escapeHtml(p.descricao || '')}', '${escapeHtml(p.img || '')}', '${escapeHtml(p.link || '')}')">Editar</button>
        <button class="btn btn-danger" onclick="deleteProject(${p.id})">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 3. Salvar ou Atualizar Projeto (INSERT / UPDATE)
if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = projectIdInput.value;
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const img = document.getElementById('img').value;
    const link = document.getElementById('link').value;

    const projectData = { nome, descricao, img, link };

    if (id) {
      const { error } = await supabase
        .from('projetos')
        .update(projectData)
        .eq('id', id);

      if (error) {
        alert('Erro ao atualizar: ' + error.message);
      } else {
        alert('Projeto atualizado com sucesso!');
      }
    } else {
      const { error } = await supabase
        .from('projetos')
        .insert([projectData]);

      if (error) {
        alert('Erro ao cadastrar: ' + error.message);
      } else {
        alert('Projeto criado com sucesso!');
      }
    }

    resetForm();
    loadProjects();
  });
}

// 4. Preencher Formulário para Edição
function editProject(id, nome, descricao, img, link) {
  if (!formTitle) return;
  formTitle.textContent = 'Editar Projeto #' + id;
  projectIdInput.value = id;
  document.getElementById('nome').value = nome;
  document.getElementById('descricao').value = descricao;
  document.getElementById('img').value = img;
  document.getElementById('link').value = link;

  if (btnCancel) btnCancel.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Deletar Projeto (DELETE)
async function deleteProject(id) {
  if (confirm(`Tem certeza que deseja excluir o projeto #${id}?`)) {
    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      alert('Projeto excluído!');
      loadProjects();
    }
  }
}

// Resetar Formulário
function resetForm() {
  if (!projectForm) return;
  if (formTitle) formTitle.textContent = 'Adicionar Novo Projeto';
  projectIdInput.value = '';
  projectForm.reset();
  if (btnCancel) btnCancel.style.display = 'none';
}

// Utilitário de segurança para texto
function escapeHtml(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Iniciar a busca dos dados ao carregar o script
loadProjects();