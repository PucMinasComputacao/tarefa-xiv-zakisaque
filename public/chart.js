let grafico = null;

window.onload = () => {
    carregarGrafico();
};

// READ + GRÁFICO

function carregarGrafico() {

    fetch("http://localhost:3000/receitas")
        .then(response => response.json())
        .then(receitas => {


            console.table(receitas);

            listarReceitas(receitas);

            const categorias = Array.from(
                new Set(receitas.map(receita => receita.categoria))
            );

            const quantidadePorCategoria = categorias.map(categoria => {

                return receitas.filter(
                    receita => receita.categoria === categoria
                ).length;

            });

            const ctx = document.getElementById("divPieChart");

            if (grafico) {
                grafico.destroy();
            }

            grafico = new Chart(ctx, {

                type: "doughnut",

                data: {
                    labels: categorias,

                    datasets: [{
                        data: quantidadePorCategoria,

                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40"
                        ]
                    }]
                },

                options: {
                    responsive: true,

                    plugins: {
                        title: {
                            display: true,
                            text: "Distribuição das Receitas por Categoria"
                        },

                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });

        })
        .catch(error => {
            console.error("ERRO:", error);
        });
}

// CREATE + UPDATE

async function salvarReceita() {

    const id = document.getElementById("idReceita").value;

    const receita = {
        nome: document.getElementById("nome").value,
        categoria: document.getElementById("categoria").value
    };

    if (receita.nome === "" || receita.categoria === "") {
        alert("Preencha todos os campos");
        return;
    }

    if (id) {

        await fetch(
            `http://localhost:3000/receitas/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: Number(id),
                    ...receita
                })
            }
        );

    } else {

        await fetch(
            "http://localhost:3000/receitas",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(receita)
            }
        );

    }

    document.getElementById("idReceita").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("categoria").value = "";

    carregarGrafico();
}

// LISTAR RECEITAS

function listarReceitas(receitas) {

    const lista = document.getElementById("listaReceitas");

    lista.innerHTML = "";

    receitas.forEach(receita => {

        lista.innerHTML += `
            <li>
                <strong>${receita.nome}</strong> - ${receita.categoria}

                <button onclick="editarReceita(${receita.id})">
                    Editar
                </button>

                <button onclick="excluirReceita(${receita.id})">
                    Excluir
                </button>
            </li>
        `;
    });
}

// EDITAR

async function editarReceita(id) {

    const response = await fetch(`http://localhost:3000/receitas/${id}`);
    const receita = await response.json();

    console.log("Editando:", receita);

    document.getElementById("idReceita").value = receita.id;
    document.getElementById("nome").value = receita.nome;
    document.getElementById("categoria").value = receita.categoria;
}

// DELETE

async function excluirReceita(id) {

    console.log("Deletando ID:", id);

    const confirmar = confirm("Deseja realmente excluir esta receita?");
    if (!confirmar) return;

    const response = await fetch(`http://localhost:3000/receitas/${id}`, {
        method: "DELETE"
    });

    console.log("Status DELETE:", response.status);

    carregarGrafico();
}