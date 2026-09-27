import type { ValidationChecks } from 'langium';
import type { MdPublisherAstType } from './generated/ast.js';
import type { MdPublisherServices } from './md-publisher-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: MdPublisherServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.MdPublisherValidator;
    const checks: ValidationChecks<MdPublisherAstType> = {
        // TODO: Declare validators for your properties
        // See doc : https://langium.org/docs/learn/workflow/create_validations/
        /*
        Element: validator.checkElement
        */
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class MdPublisherValidator {

    // TODO: Add logic here for validation checks of properties
    // See doc : https://langium.org/docs/learn/workflow/create_validations/
    /*
    checkElement(element: Element, accept: ValidationAcceptor): void {
        // Always accepts
    }
    */
}
