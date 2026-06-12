package com.example.agent.dict;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 字典系统配置 —— 初始化 DictService / DictMatcher / StaticDictProvider。
 *
 * <p>生产环境:
 * <ul>
 *   <li>替换 StaticDictProvider 为 JdbcDictProvider / RedisDictProvider</li>
 *   <li>DictService 和 DictMatcher 无需任何改动</li>
 * </ul>
 */
@Configuration
public class DictConfig {

    private static final Logger log = LoggerFactory.getLogger(DictConfig.class);

    /** DictMatcher 是无状态纯函数,单例安全 */
    @Bean
    public DictMatcher dictMatcher() {
        return new DictMatcher();
    }

    /** DictService 编排层 */
    @Bean
    public DictService dictService(DictMatcher matcher) {
        DictService service = new DictService(matcher);

        // 注册 StaticDictProvider(开发/测试用)
        StaticDictProvider staticProvider = new StaticDictProvider();
        seedCityDict(staticProvider);
        seedProductDict(staticProvider);
        seedWarehouseDict(staticProvider);
        seedCategoryDict(staticProvider);
        seedUrgencyDict(staticProvider);
        seedPaymentDict(staticProvider);
        service.registerProvider(staticProvider);

        log.info("[DictConfig] StaticDictProvider loaded: types={}", staticProvider.supportedTypes());
        return service;
    }

    // ====================================================================
    // 模拟数据(生产环境从数据库/Redis 加载)
    // ====================================================================

    /** 城市字典:含别名,支持"北京市"→"北京"匹配 */
    private void seedCityDict(StaticDictProvider p) {
        p.register("city", List.of(
            new DictItem("0001", "北京",   List.of("北京市", "京", "BJ")),
            new DictItem("0002", "上海",   List.of("上海市", "沪", "SH")),
            new DictItem("0003", "广州",   List.of("广州市", "穗", "GZ")),
            new DictItem("0004", "深圳",   List.of("深圳市", "深", "SZ")),
            new DictItem("0005", "杭州",   List.of("杭州市", "杭", "HZ")),
            new DictItem("0006", "成都",   List.of("成都市", "蓉", "CD")),
            new DictItem("0007", "南京",   List.of("南京市", "宁", "NJ")),
            new DictItem("0008", "武汉",   List.of("武汉市", "汉", "WH")),
            new DictItem("0009", "重庆",   List.of("重庆市", "渝", "CQ", "Chongqing")),
            new DictItem("0010", "天津",   List.of("天津市", "津", "TJ")),
            new DictItem("0011", "西安",   List.of("西安市", "镐", "XA")),
            new DictItem("0012", "苏州",   List.of("苏州市", "苏", "SU")),
            new DictItem("0013", "长沙",   List.of("长沙市", "星城", "CS")),
            new DictItem("0014", "郑州",   List.of("郑州市", "商都", "ZZ")),
            new DictItem("0015", "东莞",   List.of("东莞市", "莞", "DG")),
            new DictItem("0016", "青岛",   List.of("青岛市", "琴岛", "QD")),
            new DictItem("0017", "合肥",   List.of("合肥市", "庐州", "HF")),
            new DictItem("0018", "佛山",   List.of("佛山市", "禅城", "FS")),
            new DictItem("0019", "昆明",   List.of("昆明市", "春城", "KM")),
            new DictItem("0020", "沈阳",   List.of("沈阳市", "盛京", "SY")),
            new DictItem("0021", "济南",   List.of("济南市", "泉城", "JN")),
            new DictItem("0022", "哈尔滨", List.of("冰城", "哈", "HEB")),
            new DictItem("0023", "福州",   List.of("福州市", "榕城", "FZ")),
            new DictItem("0024", "厦门",   List.of("厦门市", "鹭岛", "XM")),
            new DictItem("0025", "大连",   List.of("大连市", "滨城", "DL")),
            new DictItem("0026", "贵阳",   List.of("贵阳市", "筑城", "GY")),
            new DictItem("0027", "南宁",   List.of("南宁市", "绿城", "NN")),
            new DictItem("0028", "珠海",   List.of("珠海市", "百岛之市", "ZUH")),
            new DictItem("0029", "无锡",   List.of("无锡市", "锡", "WX")),
            new DictItem("0030", "宁波",   List.of("宁波市", "甬", "NB"))
        ));
    }

    /** 产品字典:含别名,支持"华为"→"华为Mate60"匹配 */
    private void seedProductDict(StaticDictProvider p) {
        p.register("product", List.of(
            new DictItem("P001", "iPhone 15 Pro",     List.of("苹果15Pro", "iPhone15Pro", "苹果15")),
            new DictItem("P002", "iPhone 15",          List.of("苹果15", "iPhone15")),
            new DictItem("P003", "华为Mate60 Pro",     List.of("华为Mate60Pro", "Mate60Pro")),
            new DictItem("P004", "华为Mate60",         List.of("华为Mate60", "Mate60")),
            new DictItem("P005", "华为P60 Pro",        List.of("华为P60Pro", "P60Pro")),
            new DictItem("P006", "小米14 Pro",         List.of("小米14Pro", "Mi14Pro")),
            new DictItem("P007", "小米14",             List.of("小米14", "Mi14")),
            new DictItem("P008", "三星Galaxy S24",     List.of("三星S24", "GalaxyS24")),
            new DictItem("P009", "OPPO Find X7",       List.of("FindX7", "oppo x7")),
            new DictItem("P010", "vivo X100",          List.of("vivoX100", "维沃X100")),
            new DictItem("P011", "MacBook Pro 14",     List.of("苹果笔记本", "MacBookPro14")),
            new DictItem("P012", "ThinkPad X1 Carbon", List.of("联想X1", "ThinkPad")),
            new DictItem("P013", "iPad Pro 12.9",      List.of("苹果平板", "iPadPro")),
            new DictItem("P014", "Surface Pro 9",      List.of("微软平板", "SurfacePro9")),
            new DictItem("P015", "AirPods Pro 2",      List.of("苹果耳机", "AirPodsPro2")),
            new DictItem("P016", "Sony WH-1000XM5",    List.of("索尼耳机", "索尼降噪")),
            new DictItem("P017", "Dell U2723QE",       List.of("戴尔4K显示器", "Dell显示器")),
            new DictItem("P018", "Logitech MX Master3", List.of("罗技鼠标", "MXMaster")),
            new DictItem("P019", "HHKB Professional",  List.of("静电容键盘", "HHKB键盘")),
            new DictItem("P020", "Apple Watch Ultra2",  List.of("苹果手表", "AppleWatch"))
        ));
    }

    /** 仓库字典 */
    private void seedWarehouseDict(StaticDictProvider p) {
        p.register("warehouse", List.of(
            new DictItem("WH01", "北京中心仓",   List.of("北京仓", "中心仓")),
            new DictItem("WH02", "北京亦庄仓",   List.of("亦庄仓")),
            new DictItem("WH03", "上海浦东仓",   List.of("浦东仓", "上海仓")),
            new DictItem("WH04", "上海虹桥仓",   List.of("虹桥仓")),
            new DictItem("WH05", "广州白云仓",   List.of("白云仓", "广州仓")),
            new DictItem("WH06", "深圳前海仓",   List.of("前海仓", "深圳仓")),
            new DictItem("WH07", "杭州余杭仓",   List.of("余杭仓", "杭州仓")),
            new DictItem("WH08", "成都双流仓",   List.of("双流仓", "成都仓")),
            new DictItem("WH09", "武汉光谷仓",   List.of("光谷仓", "武汉仓")),
            new DictItem("WH10", "南京江宁仓",   List.of("江宁仓", "南京仓"))
        ));
    }

    /** 商品分类字典 */
    private void seedCategoryDict(StaticDictProvider p) {
        p.register("category", List.of(
            new DictItem("C01", "手机通讯",   List.of("手机", "电话")),
            new DictItem("C02", "电脑办公",   List.of("电脑", "笔记本", "办公设备")),
            new DictItem("C03", "智能穿戴",   List.of("手表", "手环", "穿戴")),
            new DictItem("C04", "影音娱乐",   List.of("耳机", "音箱", "音响")),
            new DictItem("C05", "外设配件",   List.of("键盘", "鼠标", "显示器", "配件")),
            new DictItem("C06", "家用电器",   List.of("家电", "电器")),
            new DictItem("C07", "数码存储",   List.of("U盘", "硬盘", "存储"))
        ));
    }

    /** 紧急程度字典(小字典,适合 enum 内嵌) */
    private void seedUrgencyDict(StaticDictProvider p) {
        p.register("urgency", List.of(
            new DictItem("U01", "普通",   List.of("正常", "一般")),
            new DictItem("U02", "加急",   List.of("紧急", "急")),
            new DictItem("U03", "特急",   List.of("非常紧急", "特急"))
        ));
    }

    /** 付款方式字典 */
    private void seedPaymentDict(StaticDictProvider p) {
        p.register("payment", List.of(
            new DictItem("PAY01", "银行转账",   List.of("转账", "对公转账")),
            new DictItem("PAY02", "微信支付",   List.of("微信")),
            new DictItem("PAY03", "支付宝",     List.of("阿里支付")),
            new DictItem("PAY04", "现金",       List.of("现结")),
            new DictItem("PAY05", "月结",       List.of("月结30天", "账期"))
        ));
    }
}
