document.getElementById('start').addEventListener('click', startComparison);

let elements = [];
let graph = {};
let indegree = {};

function startComparison() {
    const input = document.getElementById('elements').value;
    elements = input.split('\n').map(e => e.trim());
    elements.forEach(el => {
        graph[el] = [];
        indegree[el] = 0;
    });
    document.getElementById('comparison').style.display = 'block';
    nextComparison();
}

function nextComparison() {
    const candidates = elements.filter(el => graph[el].length === 0);
    if (candidates.length > 1) {
        const [A, B] = candidates.slice(0, 2);
        askQuestion(A, B);
    } else {
        generateReport();
    }
}

function askQuestion(A, B) {
    document.getElementById('question').textContent = `${A} 和 ${B} 哪个更优先？`;
    const optionA = document.getElementById('optionA');
    const optionB = document.getElementById('optionB');
    optionA.textContent = A;
    optionB.textContent = B;
    optionA.onclick = () => setPriority(A, B);
    optionB.onclick = () => setPriority(B, A);
}

function setPriority(higher, lower) {
    graph[higher].push(lower);
    indegree[lower]++;
    if (detectCycle()) {
        // 回退更改以防止循环
        graph[higher].pop();
        indegree[lower]--;
        alert("此优先级会引入循环，请选择不同的优先级。");
    } else {
        nextComparison();
    }
}

function detectCycle() {
    const visited = new Set();
    const stack = new Set();

    function visit(node) {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;
        visited.add(node);
        stack.add(node);
        for (let neighbor of graph[node]) {
            if (visit(neighbor)) return true;
        }
        stack.delete(node);
        return false;
    }

    for (let node of elements) {
        if (visit(node)) return true;
    }
    return false;
}

function generateReport() {
    const sortedElements = topologicalSort();
    document.getElementById('report').textContent = `优先序列生成完成！ 优先序列： ${sortedElements.join(', ')}`;
}

function topologicalSort() {
    let sorted = [];
    let queue = [];

    elements.forEach(node => {
        if (indegree[node] === 0) {
            queue.push(node);
        }
    });

    while (queue.length > 0) {
        const node = queue.shift();
        sorted.push(node);
        graph[node].forEach(neighbor => {
            indegree[neighbor]--;
            if (indegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        });
    }

    if (sorted.length !== elements.length) {
        throw new Error("Graph has a cycle!");
    }

    return sorted;
}
