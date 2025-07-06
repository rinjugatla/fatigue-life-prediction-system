import { describe, test, expect } from 'vitest';
import { existsSync } from 'fs';

describe('GitHub Pages Deployment Configuration', () => {
    test('should have .nojekyll file in static directory', () => {
        const nojekyllExists = existsSync('./static/.nojekyll');
        expect(nojekyllExists).toBe(true);
    });
    
    test('should have deployment workflow file', () => {
        const workflowExists = existsSync('./.github/workflows/deploy.yml');
        expect(workflowExists).toBe(true);
    });
});