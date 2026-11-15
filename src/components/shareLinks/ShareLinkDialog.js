import dialogHelper from '../dialogHelper/dialogHelper';
import layoutManager from '../layoutManager';
import globalize from '../../lib/globalize';
import toast from '../toast/toast';
import { copy } from '../../scripts/clipboard';

import '../../elements/emby-button/emby-button';
import '../../elements/emby-button/paper-icon-button-light';
import '../../elements/emby-input/emby-input';
import '../formdialog.scss';
import 'material-design-icons-iconfont';

import { ShareLinkError, createShareLink } from './ShareLinksApi';
import { DURATION_PRESETS, formatExpiration } from './shareLinkDurations';

function setError(dlg, message) {
    const errorElement = dlg.querySelector('.shareLinkError');
    errorElement.textContent = message || '';
    errorElement.classList.toggle('hide', !message);
}

function hideResult(dlg) {
    dlg.querySelector('.shareLinkResult').classList.add('hide');
}

function updateExpirationSummary(dlg) {
    const summary = dlg.querySelector('.shareLinkExpiresSummary');
    const selected = dlg.querySelector('.btnPreset.raised');

    if (!selected) {
        summary.classList.add('hide');
        return;
    }

    const durationSeconds = parseInt(selected.dataset.duration, 10);
    summary.textContent = globalize.translate('ShareLinkExpiresOn', formatExpiration(durationSeconds));
    summary.classList.remove('hide');
}

function selectPreset(dlg, button) {
    dlg.querySelectorAll('.btnPreset').forEach(btn => {
        const isSelected = btn === button;
        btn.classList.toggle('raised', isSelected);
        btn.classList.toggle('button-flat', !isSelected);
        btn.setAttribute('aria-pressed', String(isSelected));
    });

    hideResult(dlg);
    setError(dlg, null);
    updateExpirationSummary(dlg);
}

function copyShareUrl(dlg) {
    const urlInput = dlg.querySelector('#txtShareLinkUrl');
    if (!urlInput.value) {
        return;
    }

    copy(urlInput.value).then(() => {
        toast(globalize.translate('ShareLinkCopied'));
    }).catch(() => {
        /* The URL stays visible in the dialog for manual copying. */
    });
}

function getEditorHtml() {
    let html = '';

    html += '<div class="formDialogHeader">';
    html += `<button is="paper-icon-button-light" class="btnCancel autoSize" tabindex="-1" title="${globalize.translate('ButtonBack')}"><span class="material-icons arrow_back" aria-hidden="true"></span></button>`;
    html += '<h3 class="formDialogHeaderTitle">';
    html += globalize.translate('ShareLink');
    html += '</h3>';
    html += '</div>';

    html += '<div class="formDialogContent smoothScrollY" style="padding-top:2em;">';
    html += '<div class="dialogContentInner dialog-content-centered">';
    html += '<form class="shareLinkForm" style="margin:auto;">';

    html += '<div class="fieldDescription">';
    html += globalize.translate('ShareLinkDescription');
    html += '</div>';

    html += '<div class="selectContainer fldShareLinkDuration">';
    html += `<label class="selectLabel">${globalize.translate('LabelShareLinkDuration')}</label>`;
    html += '<div class="shareLinkPresets" role="group">';
    for (const preset of DURATION_PRESETS) {
        const cls = preset.isDefault ? 'btnPreset raised' : 'btnPreset button-flat';
        html += `<button type="button" is="emby-button" class="${cls}" data-duration="${preset.durationSeconds}" aria-pressed="${preset.isDefault}">${globalize.translate(preset.labelKey)}</button>`;
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="shareLinkExpiresSummary fieldDescription hide"></div>';

    html += '<div class="shareLinkResult hide selectContainer">';
    html += `<label class="selectLabel">${globalize.translate('LabelShareLinkUrl')}</label>`;
    html += '<div class="shareLinkUrlRow">';
    html += `<input is="emby-input" id="txtShareLinkUrl" type="text" readonly="readonly" label="${globalize.translate('LabelShareLinkUrl')}" />`;
    html += `<button type="button" is="emby-button" class="btnCopyUrl raised" title="${globalize.translate('Copy')}">${globalize.translate('Copy')}</button>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="shareLinkError fieldDescription hide" role="alert"></div>';

    html += '<div class="formDialogFooter">';
    html += `<button is="emby-button" type="submit" class="raised btnSubmit block formDialogFooterItem button-submit">${globalize.translate('ButtonCreateShareLink')}</button>`;
    html += '</div>';

    html += '</form>';
    html += '</div>';
    html += '</div>';

    return html;
}

class ShareLinkDialog {
    constructor(options) {
        this.options = options;
    }

    onSubmit(e, dlg) {
        e.preventDefault();

        const selectedPreset = dlg.querySelector('.btnPreset.raised');

        if (!selectedPreset) {
            setError(dlg, globalize.translate('MessageSelectShareLinkDuration'));
            return;
        }

        const body = { DurationSeconds: parseInt(selectedPreset.dataset.duration, 10) };

        hideResult(dlg);
        setError(dlg, null);

        const submitButton = dlg.querySelector('.btnSubmit');
        submitButton.disabled = true;

        createShareLink(this.options.itemId, body, this.options.serverId).then(dto => {
            submitButton.disabled = false;

            if (!dto || !dto.url) {
                setError(dlg, globalize.translate('MessageShareLinkCreateFailed'));
                return;
            }

            const urlInput = dlg.querySelector('#txtShareLinkUrl');
            urlInput.value = dto.url;
            dlg.querySelector('.shareLinkResult').classList.remove('hide');

            copy(dto.url).then(() => {
                toast(globalize.translate('ShareLinkCopied'));
            }).catch(() => {
                /* The URL stays visible in the dialog for manual copying. */
            });
        }).catch(error => {
            submitButton.disabled = false;

            let message = globalize.translate('MessageShareLinkCreateFailed');
            if (error instanceof ShareLinkError) {
                if (error.shareLinkErrorCode) {
                    message += ` (${error.shareLinkErrorCode})`;
                } else if (error.message) {
                    message += ` ${error.message}`;
                }
            }

            setError(dlg, message);
        });
    }

    show() {
        const dialogOptions = {
            removeOnClose: true,
            scrollY: false
        };

        if (layoutManager.tv) {
            dialogOptions.size = 'fullscreen';
        } else {
            dialogOptions.size = 'small';
        }

        const dlg = dialogHelper.createDialog(dialogOptions);

        dlg.classList.add('formDialog');
        dlg.innerHTML = getEditorHtml();

        dlg.querySelector('.btnCancel').addEventListener('click', () => dialogHelper.close(dlg));

        dlg.querySelector('.shareLinkForm').addEventListener('submit', e => this.onSubmit(e, dlg));

        dlg.querySelectorAll('.btnPreset').forEach(btn => {
            btn.addEventListener('click', () => selectPreset(dlg, btn));
        });

        dlg.querySelector('.btnCopyUrl').addEventListener('click', () => copyShareUrl(dlg));

        updateExpirationSummary(dlg);

        return new Promise(resolve => {
            dlg.addEventListener('close', resolve);
            dialogHelper.open(dlg);
        });
    }
}

export default ShareLinkDialog;
