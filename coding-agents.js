export const CODING_AGENTS = Object.freeze([
  {
    value: "codex",
    name: "Codex",
    skillsDirectory: ".agents/skills",
  },
  {
    value: "trae",
    name: "Trae",
    skillsDirectory: ".trae/skills",
  },
  {
    value: "cursor",
    name: "Cursor",
    skillsDirectory: ".cursor/skills",
  },
  {
    value: "github-copilot",
    name: "VS Code Copilot",
    skillsDirectory: ".agents/skills",
  },
]);

const CODING_AGENTS_BY_VALUE = new Map(
  CODING_AGENTS.map((agent) => [agent.value, agent]),
);

export function getCodingAgent(codingAgent) {
  return CODING_AGENTS_BY_VALUE.get(codingAgent);
}
