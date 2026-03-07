package com.makerspace.service;

import com.makerspace.dto.ArticleDtos;
import com.makerspace.entity.Article;
import com.makerspace.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    private ArticleDtos.ArticleResponse toResponse(Article a) {
        return ArticleDtos.ArticleResponse.builder()
                .articleId(a.getArticleId())
                .title(a.getTitle())
                .author(a.getAuthor())
                .imageUrl(a.getImageUrl())
                .content(a.getContent())
                .tags(a.getTags())
                .status(a.getStatus().name())
                .publishedAt(a.getPublishedAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }

    public List<ArticleDtos.ArticleResponse> list() {
        return articleRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ArticleDtos.ArticleResponse get(UUID id) {
        Article a = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        return toResponse(a);
    }

    public ArticleDtos.ArticleResponse create(ArticleDtos.CreateArticleRequest req) {
        Article a = Article.builder()
                .title(req.getTitle())
                .author(req.getAuthor())
                .imageUrl(req.getImageUrl())
                .content(req.getContent())
                .tags(req.getTags())
                .status(Article.Status.DRAFT)
                .build();
        return toResponse(articleRepository.save(a));
    }

    public ArticleDtos.ArticleResponse update(UUID id, ArticleDtos.UpdateArticleRequest req) {
        Article a = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        if (req.getTitle() != null) a.setTitle(req.getTitle());
        if (req.getAuthor() != null) a.setAuthor(req.getAuthor());
        if (req.getImageUrl() != null) a.setImageUrl(req.getImageUrl());
        if (req.getContent() != null) a.setContent(req.getContent());
        if (req.getTags() != null) a.setTags(req.getTags());
        if (req.getStatus() != null) a.setStatus(Article.Status.valueOf(req.getStatus()));
        return toResponse(articleRepository.save(a));
    }

    public void delete(UUID id) {
        articleRepository.deleteById(id);
    }

    public ArticleDtos.ArticleResponse publish(UUID id) {
        Article a = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        a.setStatus(Article.Status.PUBLISHED);
        a.setPublishedAt(LocalDateTime.now());
        return toResponse(articleRepository.save(a));
    }

    public ArticleDtos.ArticleResponse unpublish(UUID id) {
        Article a = articleRepository.findById(id).orElseThrow(() -> new RuntimeException("Article not found"));
        a.setStatus(Article.Status.DRAFT);
        a.setPublishedAt(null);
        return toResponse(articleRepository.save(a));
    }
}
