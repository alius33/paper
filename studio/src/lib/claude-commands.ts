import type { CommandTemplate, GeneratedCommand } from '@/types/claude';

/**
 * Returns the pre-built command templates for common writing operations.
 */
export function getCommandTemplates(): CommandTemplate[] {
  return [
    {
      id: 'rewrite',
      name: 'Rewrite',
      description: 'Rewrite a file following the CLAUDE.md voice and style rules',
      template:
        'Read the file at {{filePath}} and rewrite it following the voice and style rules in CLAUDE.md. ' +
        'Maintain the existing plot beats and character actions, but improve the prose quality, ' +
        'sensory detail, and emotional resonance. {{instruction}}',
      variables: ['filePath', 'instruction'],
      defaultContextFiles: ['CLAUDE.md'],
    },
    {
      id: 'continue',
      name: 'Continue Writing',
      description: 'Continue writing the next scene from where the current chapter ends',
      template:
        'Read the file at {{filePath}} and continue writing the next scene. ' +
        'Match the established voice, maintain continuity with the previous scene, ' +
        'and follow the plot outline in series-overview.md. {{instruction}}',
      variables: ['filePath', 'instruction'],
      defaultContextFiles: ['CLAUDE.md', 'series-overview.md'],
    },
    {
      id: 'research',
      name: 'Research',
      description: 'Search the research/ directory for information on a topic',
      template:
        'Search the research/ directory for information about {{instruction}}. ' +
        'Summarize the relevant findings and note any gaps or contradictions. ' +
        'Cross-reference with the timeline and character bible in CLAUDE.md.',
      variables: ['instruction'],
      defaultContextFiles: ['CLAUDE.md'],
    },
    {
      id: 'continuity',
      name: 'Continuity Check',
      description: 'Check continuity across all chapters',
      template:
        'Read all existing chapters in chapters/book-1/ and perform a continuity check. ' +
        'Cross-reference against the timeline in CLAUDE.md section 7 and the plot outline in series-overview.md. ' +
        'Report issues by severity: Critical (timeline contradictions, character knowledge errors), ' +
        'Moderate (description inconsistencies, tone shifts), Minor (terminology, spelling). {{instruction}}',
      variables: ['instruction'],
      defaultContextFiles: ['CLAUDE.md', 'series-overview.md'],
    },
    {
      id: 'edit-scene',
      name: 'Edit Scene',
      description: 'Edit a specific scene within a chapter',
      template:
        'Read the file at {{filePath}} and edit the scene as described: {{instruction}}. ' +
        'Follow the expansion vs. new beats rule from CLAUDE.md: add sensory detail, ' +
        'interiority, and character interaction, but do not add new plot beats unless explicitly requested. ' +
        'Preserve the established voice.',
      variables: ['filePath', 'instruction'],
      defaultContextFiles: ['CLAUDE.md'],
    },
    {
      id: 'voice-check',
      name: 'Voice Check',
      description: 'Check dialogue against character voice profiles in CLAUDE.md',
      template:
        'Read the file at {{filePath}} and check all dialogue against the character voice ' +
        'profiles in CLAUDE.md section 4. For each speaking character, verify: ' +
        '(1) the dialogue matches their established voice patterns, ' +
        '(2) no modern idioms or anachronisms are present, ' +
        '(3) dialogue tags follow the minimal style rules, ' +
        '(4) characters speak distinctly from one another. {{instruction}}',
      variables: ['filePath', 'instruction'],
      defaultContextFiles: ['CLAUDE.md'],
    },
  ];
}

/**
 * Generates a Claude command from a template or custom instruction.
 *
 * @param templateId - The template ID to use, or null for a custom command
 * @param instruction - The user's specific instruction or additional context
 * @param filePath - The file path the command relates to
 * @param contextFiles - Optional additional context files to reference
 * @returns The generated command with description and timestamp
 */
export function generateCommand(
  templateId: string | null,
  instruction: string,
  filePath: string,
  contextFiles?: string[]
): GeneratedCommand {
  const templates = getCommandTemplates();

  if (templateId) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Unknown template: ${templateId}`);
    }

    // Substitute variables in the template
    let command = template.template;
    command = command.replace(/\{\{filePath\}\}/g, filePath);
    command = command.replace(/\{\{instruction\}\}/g, instruction || '');

    // Merge context files
    const allContextFiles = [
      ...template.defaultContextFiles,
      ...(contextFiles || []),
    ];

    // Remove duplicates
    const uniqueContextFiles = [...new Set(allContextFiles)];

    if (uniqueContextFiles.length > 0) {
      command += `\n\nContext files: ${uniqueContextFiles.join(', ')}`;
    }

    return {
      command: command.trim(),
      description: `${template.name}: ${instruction || filePath}`,
      timestamp: new Date().toISOString(),
    };
  }

  // Custom command (no template)
  let command = instruction;

  if (filePath) {
    command = `Working with file: ${filePath}\n\n${instruction}`;
  }

  const allContextFiles = contextFiles || [];
  if (allContextFiles.length > 0) {
    command += `\n\nContext files: ${allContextFiles.join(', ')}`;
  }

  return {
    command: command.trim(),
    description: `Custom: ${instruction.substring(0, 80)}${instruction.length > 80 ? '...' : ''}`,
    timestamp: new Date().toISOString(),
  };
}
