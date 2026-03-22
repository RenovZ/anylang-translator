<script lang="ts">
  import { Button } from 'flowbite-svelte';

  import { i18n } from '../../../lib/i18n';
  import Section from './Section.svelte';
  import SectionRow from './SectionRow.svelte';
</script>

<Section
  id="feedback"
  title={i18n('options_feedback_title', { defaultValue: 'Feedback' })}
  description={i18n('options_feedback_description', {
    defaultValue: 'Found an issue or have ideas? Tell us.'
  })}>
  <SectionRow
    title={i18n('options_feedback_submit_title', { defaultValue: 'Submit feedback' })}
    description={i18n('options_feedback_submit_description', {
      defaultValue: 'Open a GitHub issue or join community discussions'
    })}>
    <div class="space-y-3">
      <Button color="light" class="w-full rounded-xl border-none shadow-md"
        >{i18n('options_feedback_github_button', { defaultValue: 'GitHub Issues' })}</Button>
      <Button color="light" class="w-full rounded-xl border-none shadow-md"
        >{i18n('options_feedback_discord_button', {
          defaultValue: 'Join Discord community'
        })}</Button>
    </div>
  </SectionRow>
</Section>
