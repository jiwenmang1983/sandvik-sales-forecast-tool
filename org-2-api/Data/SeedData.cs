using org2_api.Models;

namespace org2_api.Data;

public static class SeedData
{
    public static List<OrgNode> GetSeedData()
    {
        var nodes = new List<OrgNode>
        {
            // CEO
            new OrgNode { Id = 1, Name = "Frank Tao", Email = "frank.tao@sandvik.com", Role = "CEO", ParentId = null, Status = "Active" },

            // VP Sales
            new OrgNode { Id = 2, Name = "Li Na", Email = "li.na@sandvik.com", Role = "VP Sales", ParentId = 1, Region = "华东大区", Status = "Active" },

            // Director APAC under VP Sales
            new OrgNode { Id = 3, Name = "Zhang Wei", Email = "zhang.wei@sandvik.com", Role = "Director APAC", ParentId = 2, Status = "Active" },

            // Sales under Director APAC
            new OrgNode { Id = 4, Name = "Zhou Ting", Email = "zhou.ting@sandvik.com", Role = "Sales", ParentId = 3, Status = "Active" },
            new OrgNode { Id = 5, Name = "Wang Qiang", Email = "qiang.wang@sandvik.com", Role = "Sales", ParentId = 3, Status = "Active" },

            // Director 华南大区 directly under CEO
            new OrgNode { Id = 6, Name = "Chen Zhiyuan", Email = "zhiyuan.chen@sandvik.com", Role = "Director", ParentId = 1, Region = "华南大区", Status = "Active" },
        };

        return nodes;
    }
}
