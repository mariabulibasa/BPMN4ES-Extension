
// Opens a dialog to configure a KEI condition for a sequence flow
export function openKeiDialog(availableVariables, onConfirm) {
  // Create the main dialog container
  const dialog = document.createElement('div');
  dialog.className = 'leaf-dialog';

  // Header
  const header = document.createElement('div');
  header.className = 'ld-header';
  header.textContent = 'Configure KEI condition';
  dialog.appendChild(header);

  // Body 
  const body = document.createElement('div');
  body.className = 'ld-body';

  // Variable dropdown containing process variables from tasks that have KEIs attached to them
  const varRow = createRow('Variable:');
  const select = document.createElement('select');
  select.id = 'ld-var';

  if (availableVariables.length) {
    for (const v of availableVariables) {
      const option = document.createElement('option');
      option.value = v.id;
      option.textContent = v.label;
      select.appendChild(option);
    }
  } else {
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = '(No KEI tasks found)';
    select.appendChild(option);
  }

  varRow.querySelector('label').appendChild(select);
  body.appendChild(varRow);

  // Operator input
  const opRow = createRow('Operator:');
  const opInput = document.createElement('input');
  opInput.type = 'text';
  opInput.placeholder = 'e.g. > or ==';
  opInput.id = 'ld-operator';
  opRow.querySelector('label').appendChild(opInput);
  body.appendChild(opRow);

  // Numeric value input
  const valRow = createRow('Value:');
  const valInput = document.createElement('input');
  valInput.type = 'number';
  valInput.placeholder = 'e.g. 100';
  valInput.id = 'ld-value';
  valRow.querySelector('label').appendChild(valInput);
  body.appendChild(valRow);

  dialog.appendChild(body);

  // Footer 
  const footer = document.createElement('div');
  footer.className = 'ld-footer';

  const okButton = document.createElement('button');
  okButton.id = 'ld-ok';
  okButton.textContent = 'OK';
  okButton.disabled = true;

  const cancelButton = document.createElement('button');
  cancelButton.id = 'ld-cancel';
  cancelButton.textContent = 'Cancel';

  footer.appendChild(okButton);
  footer.appendChild(cancelButton);
  dialog.appendChild(footer);

  document.body.appendChild(dialog);

  // Enable OK button only when operator and value are filled
  const updateOkState = () => {
    okButton.disabled = !(opInput.value.trim() && valInput.value.trim());
  };

  opInput.addEventListener('input', updateOkState);
  valInput.addEventListener('input', updateOkState);

  // Cancel button closes the dialog
  cancelButton.onclick = closeDialog;

  // OK button confirms and closes the dialog
  okButton.onclick = () => {
    const selectedId = select.value;
    const selectedVar = availableVariables.find(v => v.id === selectedId);
    if (!selectedVar) return;

    const expression = `${selectedVar.label} ${opInput.value.trim()} ${valInput.value.trim()}`;
    onConfirm(expression);
    closeDialog();
  };

  // Close the dialog if clicking outside of it
  const handleOutsideClick = e => {
    if (!dialog.contains(e.target)) closeDialog();
  };

  setTimeout(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  }, 0);

  // Helper to clean up the dialog and listener
  function closeDialog() {
    document.removeEventListener('mousedown', handleOutsideClick);
    document.body.removeChild(dialog);
  }

  // Helper to create a row with a label
  function createRow(labelText) {
    const row = document.createElement('div');
    row.className = 'ld-row';

    const label = document.createElement('label');
    label.textContent = labelText;
    row.appendChild(label);

    return row;
  }
}
