export class FormHelper {

  public static getFormChanges(initialModel: any, currentModel: any): any {
    const changes: any = {};
    Object.keys(initialModel).forEach(key => {
      if (this.isObject(initialModel[key]) && this.isObject(currentModel[key])) {
        const deepChanges = this.getFormChanges(initialModel[key], currentModel[key]);
        if (Object.keys(deepChanges).length > 0) {
          changes[key] = deepChanges;
        }
      } else if (initialModel[key] !== currentModel[key] && typeof currentModel[key] !== 'undefined') {
        changes[key] = currentModel[key];
      }
    });
    return changes;
  }

  private static isObject(item: any): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  public static isEmptyObject(obj: any): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

}

// ES2800730100510545217508