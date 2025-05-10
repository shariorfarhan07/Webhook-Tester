// Wait for the DOM to be fully loaded

document.addEventListener('DOMContentLoaded', function() {
    const webhooksList = document.getElementById('webhooks-list');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-url');
    const webhookUrl = document.getElementById('webhook-url');
    const wsStatus = document.getElementById('ws-status');
    const accordion = document.querySelector('.accordion');
    const panel = document.querySelector('.panel');

    // Forms and current value elements
    const delayForm = document.getElementById('delay-form');
    const statusCodeForm = document.getElementById('status-code-form');
    const responseForm = document.getElementById('response-form');
    const currentDelaySpan = document.querySelector('#current-delay span');
    const currentStatusCodeSpan = document.querySelector('#current-status-code span');
    const currentResponseSpan = document.querySelector('#current-response span');

    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    webhookUrl.textContent = window.location.origin + '/webhook';

    // Accordion functionality
    accordion.addEventListener('click', function() {
        this.classList.toggle('active');
        if (panel.style.display === 'flex') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'flex';
            fetchCurrentSettings();
        }
    });

    // Fetch all current settings from server
    function fetchCurrentSettings() {
        fetchCurrentDelay();
        fetchCurrentStatusCode();
        fetchCurrentResponse();
    }

    // Delay form submission
    delayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const delayInput = document.getElementById('delay-input');
        const delayValue = delayInput.value;

        const formData = new FormData();
        formData.append('delay', delayValue);

        fetch('/api/set_delay', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            currentDelaySpan.textContent = data.delay;
            flashElement(currentDelaySpan);
        })
        .catch(error => {
            console.error('Error setting delay:', error);
            alert('Failed to set delay. Check console for details.');
        });
    });

    // Status code form submission
    statusCodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const statusCodeInput = document.getElementById('status-code-input');
        const statusCodeValue = statusCodeInput.value;

        const formData = new FormData();
        formData.append('status_code', statusCodeValue);

        fetch('/api/set_status_code', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            currentStatusCodeSpan.textContent = data.status_code;
            flashElement(currentStatusCodeSpan);
        })
        .catch(error => {
            console.error('Error setting status code:', error);
            alert('Failed to set status code. Check console for details.');
        });
    });

    // Custom response form submission
    responseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const responseInput = document.getElementById('response-input');
        let responseValue = responseInput.value;

        // Validate JSON
        try {
            JSON.parse(responseValue);
        } catch (error) {
            alert('Invalid JSON. Please check your format.');
            return;
        }

        const formData = new FormData();
        formData.append('response', responseValue);

        fetch('/api/set_response', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            currentResponseSpan.textContent = data.response;
            flashElement(currentResponseSpan);
        })
        .catch(error => {
            console.error('Error setting custom response:', error);
            alert('Failed to set custom response. Check console for details.');
        });
    });

    // Fetch current delay from server
    function fetchCurrentDelay() {
        fetch('/api/get_delay')
            .then(response => response.json())
            .then(data => {
                currentDelaySpan.textContent = data.delay;
                document.getElementById('delay-input').value = data.delay;
            })
            .catch(error => {
                console.error('Error fetching current delay:', error);
            });
    }

    // Fetch current status code from server
    function fetchCurrentStatusCode() {
        fetch('/api/get_status_code')
            .then(response => response.json())
            .then(data => {
                currentStatusCodeSpan.textContent = data.status_code;
                document.getElementById('status-code-input').value = data.status_code;
            })
            .catch(error => {
                console.error('Error fetching current status code:', error);
            });
    }

    // Fetch current custom response from server
    function fetchCurrentResponse() {
        fetch('/api/get_response')
            .then(response => response.json())
            .then(data => {
                let formattedResponse;
                try {
                    formattedResponse = JSON.stringify(JSON.parse(data.response), null, 2);
                } catch (e) {
                    formattedResponse = data.response;
                }
                currentResponseSpan.textContent = formattedResponse;
                document.getElementById('response-input').value = formattedResponse;
            })
            .catch(error => {
                console.error('Error fetching current response:', error);
            });
    }

    // Visual feedback for updates
    function flashElement(element) {
        element.classList.add('flash-success');
        setTimeout(() => {
            element.classList.remove('flash-success');
        }, 1500);
    }

    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(webhookUrl.textContent).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    clearBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all webhooks?')) {
            fetch('/api/clear', { method: 'POST' })
                .then(response => response.json())
                .catch(error => {
                    console.error('Error clearing webhooks:', error);
                });
        }
    });

    function createWebhookElement(webhook, isNew = false) {
        const webhookItem = document.createElement('div');
        webhookItem.className = 'webhook-item';
        if (isNew) webhookItem.classList.add('new');

        const header = document.createElement('div');
        header.className = 'webhook-header';
        header.innerHTML = `
            <span class="webhook-id">#${webhook.id}</span>
            <span class="webhook-timestamp">${webhook.timestamp}</span>
            <span class="webhook-content-type">${webhook.content_type}</span>
        `;

        const details = document.createElement('div');
        details.className = 'webhook-details';

        const headersSection = document.createElement('div');
        headersSection.className = 'webhook-section';
        headersSection.innerHTML = `
            <h3>Headers</h3>
            <pre class="json"><code>${JSON.stringify(webhook.headers, null, 2)}</code></pre>
        `;

        const payloadSection = document.createElement('div');
        payloadSection.className = 'webhook-section';
        payloadSection.innerHTML = `
            <h3>Payload</h3>
            <pre class="json"><code>${JSON.stringify(webhook.payload, null, 2)}</code></pre>
        `;

        details.appendChild(headersSection);
        details.appendChild(payloadSection);
        webhookItem.appendChild(header);
        webhookItem.appendChild(details);

        return webhookItem;
    }

    function connectWebSocket() {
        wsStatus.textContent = 'Connecting...';
        wsStatus.className = 'connecting';

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

        socket.addEventListener('open', () => {
            wsStatus.textContent = 'Connected';
            wsStatus.className = 'connected';
            reconnectAttempts = 0;
            startHeartbeat();
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'initial_data':
                    webhooksList.innerHTML = '';
                    if (data.webhooks.length === 0) {
                        const noWebhooks = document.createElement('div');
                        noWebhooks.className = 'no-webhooks';
                        noWebhooks.innerHTML = '<p>No webhooks received yet. Send a POST request to the webhook URL above.</p>';
                        webhooksList.appendChild(noWebhooks);
                    } else {
                        data.webhooks.slice().reverse().forEach(webhook => {
                            const el = createWebhookElement(webhook);
                            webhooksList.appendChild(el);
                        });
                    }
                    break;
                case 'new_webhook':
                    if (webhooksList.querySelector('.no-webhooks')) {
                        webhooksList.innerHTML = '';
                    }
                    const newEl = createWebhookElement(data.webhook, true);
                    webhooksList.insertBefore(newEl, webhooksList.firstChild);
                    break;
                case 'clear_webhooks':
                    webhooksList.innerHTML = '';
                    const emptyEl = document.createElement('div');
                    emptyEl.className = 'no-webhooks';
                    emptyEl.innerHTML = '<p>No webhooks received yet. Send a POST request to the webhook URL above.</p>';
                    webhooksList.appendChild(emptyEl);
                    break;
            }
        });

        socket.addEventListener('close', () => {
            wsStatus.textContent = 'Disconnected';
            wsStatus.className = 'disconnected';
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                const timeout = Math.min(1000 * reconnectAttempts, 5000);
                console.log(`Reconnecting in ${timeout / 1000} seconds...`);
                setTimeout(connectWebSocket, timeout);
            } else {
                alert('WebSocket connection failed. Please refresh the page.');
            }
        });

        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
            socket.close();
        });
    }

    let heartbeatInterval;
    function startHeartbeat() {
        clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send('ping');
            } else {
                clearInterval(heartbeatInterval);
            }
        }, 30000);
    }

    // Initialize
    connectWebSocket();
    // Only fetch settings if the panel is visible
    if (panel.style.display === 'flex') {
        fetchCurrentSettings();
    }
});