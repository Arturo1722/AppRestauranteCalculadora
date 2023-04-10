let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const  btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    // Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some( campo => campo === '');

    if(camposVacios) {
        // Verificar si ya hay alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta) {
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los Campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);


            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }

        return;
    }

    // Asignar datos del formulario al cliente
    cliente = {...cliente, mesa, hora}

    // Ocultar el modal de la fecha y hora
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    // Mostrar las secciones 
    mostrarSecciones();

    // Obtener Platillos de la API de JSON SERVER
    obtenerPlatillos();

}

function mostrarSecciones() {
    const seccionesOcul = document.querySelectorAll('.d-none');
    seccionesOcul.forEach( seccion => seccion.classList.remove('d-none'))
}

function obtenerPlatillos() {
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( resultado => mostrarPlatillos(resultado) )
        .then( error => console.log(error) )
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row');

        const nombre = document.createElement('DIV');
        nombre.classList.add('col-md-4'),
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        // Función que detecta la cantidad ya elplatillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
            agregarPlatillo({...platillo, cantidad});
        }

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
}

function agregarPlatillo(producto) {
    
    // Extrael el pedido actual
    let {pedido} = cliente;

    // Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0 ) {

        // Comprueba si el elemento ya existe en el array
        if( pedido.some ( articulo => articulo.id === producto.id ) ) {
            // el articulo ya existe, actualizamos la cantidad del mismo
            const pedidoActualizado = pedido.map( articulo => {
                if(articulo.id === producto.id ) {
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            // Se asigna el nuevo array al cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        } else {
            // El articulo no existe, lo agregamos al array de pedido
            cliente.pedido = [...pedido, producto];
        }
    } else {
        // Eliminar elmentos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );
        cliente.pedido = [...resultado];
    }

    // Limpiar el HTL
    limpiarHTML();

    if( cliente.pedido.length ) {
        //  Mostrar el Resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }
}

   

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

    // Mostrar la Mesa

    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    mesa.appendChild(mesaSpan);

    // Hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');
    hora.appendChild(horaSpan);

    // Titulo de la sección
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Pedidos';
    heading.classList.add('my-4', 'text-center');

    // Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('text-center', 'my-4');
        nombreEl.textContent = nombre;

        // Cantidad del articulo
        const cantidadEl = document.createElement('P');        
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        // Precio del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        // SUbtotal del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(articulo);

        // Botón para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar Pedido';

        // Función para eliminar del pedido con el botón
        btnEliminar.onclick = function() {
            eliminarProducto(id)
        }

        // Agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        // Agregar Elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        // Agregar lista al grupo principal
        grupo.appendChild(lista);
    });

    // Agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);
    
    contenido.appendChild(resumen);

    // Motrar el formulario de propinas 
    formularioPropinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild) {
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(articulo) {
    const {cantidad, precio} = articulo;
    return `$ ${cantidad * precio}`;
}

function eliminarProducto(id) {
    const {pedido} = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    // Limpiar el html
    limpiarHTML();

    if( cliente.pedido.length ) {
        //  Mostrar el Resumen
        actualizarResumen();
    } else {
        mensajePedidoVacio();
    }

    // El producto se eliminó por lo tanto regresamos la cantidad de los pedidos a 0
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
    
}

function mensajePedidoVacio () {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade Productos al Pedido';

    contenido.appendChild(texto);
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

   // Propina 10%
   const radio10  = document.createElement('INPUT');
   radio10.type = 'radio';
   radio10.name = 'propina';
   radio10.value = "10";
   radio10.classList.add('form-check-input');
   radio10.onclick = calcularPropina;

   const radio10Label = document.createElement('LABEL');
   radio10Label.textContent = '10%';
   radio10Label.classList.add('form-check-label');

   const radio10Div = document.createElement('DIV');
   radio10Div.classList.add('form-check');

   radio10Div.appendChild(radio10);
   radio10Div.appendChild(radio10Label);

   // Propina al 25%
   const radio25  = document.createElement('INPUT');
   radio25.type = 'radio';
   radio25.name = 'propina';
   radio25.value = "25";
   radio25.classList.add('form-check-input');
   radio25.onclick = calcularPropina;

   const radio25Label = document.createElement('LABEL');
   radio25Label.textContent = '25%';
   radio25Label.classList.add('form-check-label');

   const radio25Div = document.createElement('DIV');
   radio25Div.classList.add('form-check');

   radio25Div.appendChild(radio25);
   radio25Div.appendChild(radio25Label);

   // Propina al 50%
   const radio50  = document.createElement('INPUT');
   radio50.type = 'radio';
   radio50.name = 'propina';
   radio50.value = "50";
   radio50.classList.add('form-check-input');
   radio50.onclick = calcularPropina;

   const radio50Label = document.createElement('LABEL');
   radio50Label.textContent = '50%';
   radio50Label.classList.add('form-check-label');

   const radio50Div = document.createElement('DIV');
   radio50Div.classList.add('form-check');

   radio50Div.appendChild(radio50);
   radio50Div.appendChild(radio50Label);


   // añadir a los formularios
   divFormulario.appendChild(heading);
   divFormulario.appendChild(radio10Div);
   divFormulario.appendChild(radio25Div);
   divFormulario.appendChild(radio50Div);
   

    // agregar al formulario
    formulario.appendChild(divFormulario);
    
    contenido.appendChild(formulario);
}

function calcularPropina() {
    
    const {pedido} = cliente;
    let subtotal = 0;

    // Calcular el Subtotal a pagar 
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    // Seleccionar el radio Button con la propina de cliente 
    const radioSeleccionado = document.querySelector('[name="propina"]:checked').value;

    // Calcular la Propina 
    const propina = ((subtotal * parseInt(radioSeleccionado)) / 100) ;
    const total = propina + subtotal; 
    
    mostrarTotalHTML( subtotal, total, propina )
}

function mostrarTotalHTML( subtotal, total, propina ) {

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    // subto
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);

    // total 
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    // Eliminar el último resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }

    
    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);


    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);

}