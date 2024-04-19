export class ParseController {
  private readonly STRINGS_SQL: string[] = ['Select', 'From', 'Where', 'Join On'];
  private readonly OPERATORS: string[] = ['=', '>', '<', '<=', '>=', '<>', 'And', ','];

  validateSQL(sql: string): boolean {
    if (this.validateSyntax(sql)) {
      return this.validateTableFields(sql);
    }
    return false;
  }

  validateSyntax(sqlString: string): boolean {
    const regex = /^(SELECT|FROM|WHERE|JOIN|ON|\=|\>|\<|\<\=|\>\=|\<\>|AND|,|\s)+$/i;
    return regex.test(sqlString);
  }

  validateTableFields(sqlString: string): boolean {
    return true;
  }
}
