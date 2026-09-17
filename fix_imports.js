const fs = require('fs');

let helpers = fs.readFileSync('helpers.tsx', 'utf-8');
const searchString = "  Zap,\n} from \"lucide-react\";";
const replaceString = `  Zap,
  Settings,
  Info,
  Infinity as InfinityIcon,
  LayoutGrid,
  List,
  Plus,
  Target,
  File,
  Eye,
  Settings2,
  ArrowUp,
} from "lucide-react";`;

helpers = helpers.replace(searchString, replaceString);
fs.writeFileSync('helpers.tsx', helpers);
