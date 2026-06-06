/**
 * PortalForm — Generic tenant portal form handler
 * Submits multipart/form-data to Ticket Masala's /api/portal/submit endpoint
 */

export class PortalForm {
    constructor(config = {}) {
        this.config = {
            formId: 'submissionForm',
            apiEndpoint: 'http://localhost:8085/api/portal/submit',
            tenant: 'default',
            minDescriptionLength: 10,
            customFieldId: null,
            customFieldLabel: null,
            messages: {
                charCounter: '{length} / {min} characters minimum',
                charCounterError: 'Please enter at least {min} characters',
                pdfOnly: 'Only PDF files are accepted.',
                chooseFile: 'Choose a file',
                submitError: 'An error occurred. Please try again.',
            },
            ...config,
        };

        this.form = null;
        this.loadingOverlay = null;
        this.fileInput = null;
        this.fileNameDisplay = null;
        this.descriptionInput = null;
        this.charCounter = null;
    }

    init() {
        this.form = document.getElementById(this.config.formId);
        if (!this.form) {
            console.error(`PortalForm: form with id "${this.config.formId}" not found`);
            return;
        }

        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.fileInput = this.form.querySelector('input[type="file"]');
        this.fileNameDisplay = document.getElementById('fileName');
        this.descriptionInput = this.form.querySelector('textarea[name="description"], textarea#description');

        this._bindFileInput();
        this._bindCharCounter();
        this._bindSubmit();
    }

    _bindFileInput() {
        if (!this.fileInput) return;

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) {
                if (this.fileNameDisplay) {
                    this.fileNameDisplay.textContent = this.config.messages.chooseFile;
                }
                return;
            }

            // Validate PDF
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                alert(this.config.messages.pdfOnly);
                this.fileInput.value = '';
                if (this.fileNameDisplay) {
                    this.fileNameDisplay.textContent = this.config.messages.chooseFile;
                }
                return;
            }

            if (this.fileNameDisplay) {
                this.fileNameDisplay.textContent = file.name;
            }
        });
    }

    _bindCharCounter() {
        if (!this.descriptionInput) return;

        // Create counter element if it doesn't exist
        const hint = document.getElementById('desc-hint');
        this.charCounter = hint || document.createElement('small');
        if (!this.charCounter.id) {
            this.charCounter.id = 'desc-hint';
            this.charCounter.className = 'block text-xs text-muted italic';
            this.descriptionInput.parentNode.appendChild(this.charCounter);
        }

        const updateCounter = () => {
            const length = this.descriptionInput.value.length;
            const min = this.config.minDescriptionLength;
            const msg = length >= min
                ? this.config.messages.charCounter.replace('{length}', length).replace('{min}', min)
                : this.config.messages.charCounterError.replace('{min}', min);
            this.charCounter.textContent = msg;
            this.charCounter.style.color = length >= min ? 'var(--color-muted)' : 'var(--color-error)';
        };

        this.descriptionInput.addEventListener('input', updateCounter);
        updateCounter();
    }

    _bindSubmit() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!this.form.checkValidity()) {
                this.form.reportValidity();
                return;
            }

            // Validate description length
            if (this.descriptionInput && this.descriptionInput.value.length < this.config.minDescriptionLength) {
                alert(this.config.messages.charCounterError.replace('{min}', this.config.minDescriptionLength));
                this.descriptionInput.focus();
                return;
            }

            // Validate file if present
            if (this.fileInput && this.fileInput.files[0]) {
                const file = this.fileInput.files[0];
                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                    alert(this.config.messages.pdfOnly);
                    return;
                }
            }

            await this._submit();
        });
    }

    async _submit() {
        this._showLoading(true);

        try {
            const formData = new FormData();
            const data = new FormData(this.form);

            // Map standard fields
            const customerName = data.get('customerName');
            const customerEmail = data.get('customerEmail');
            const customerPhone = data.get('customerPhone');
            const description = data.get('description');
            const requestType = data.get('requestType');
            const priority = data.get('priorite') || data.get('priority');
            const file = data.get('attachment');

            if (customerName) formData.append('CustomerName', this._sanitize(customerName));
            if (customerEmail) formData.append('CustomerEmail', this._sanitize(customerEmail));
            if (customerPhone) formData.append('CustomerPhone', this._sanitize(customerPhone));
            if (description) formData.append('Description', this._sanitize(description));
            if (requestType) formData.append('WorkItemType', this._sanitize(requestType));
            if (priority) formData.append('PriorityScore', priority);

            // Custom field (e.g., quartier) → Tags
            if (this.config.customFieldId) {
                const customValue = data.get(this.config.customFieldId);
                if (customValue) {
                    formData.append(
                        'Tags',
                        `${this.config.customFieldLabel || this.config.customFieldId}:${this._sanitize(customValue)}`
                    );
                }
            }

            // Tenant
            formData.append('Tenant', this.config.tenant);

            // File
            if (file && file.size > 0) {
                formData.append('Attachment', file);
            }

            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                sessionStorage.setItem('submissionResult', JSON.stringify(result));
                window.location.href = 'success.html';
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('PortalForm submission error:', error);
            alert(this.config.messages.submitError);
            this._showLoading(false);
        }
    }

    _showLoading(show) {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    _sanitize(input) {
        if (!input) return '';
        return String(input).replace(/<[^>]*>/g, '');
    }
}
